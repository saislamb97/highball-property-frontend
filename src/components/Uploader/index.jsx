import { useCallback, useEffect, useState } from 'react';
import { cloneDeep } from 'lodash'
import { styled } from '@mui/material/styles';
import { Box, Button, Avatar, Badge, Tooltip, useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { SelectAllRounded, Preview, CloudUpload, Delete, AddPhotoAlternate } from '@mui/icons-material';
import axiosInstance from 'src/utils/axiosInstance';
import { asset, delay } from 'src/utils/Utils'
import { tokens } from 'src/theme';
import ImagePreview from './ImagePreview';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
  outline: 'none'
});

const [READING, WAITING, UPLOADING, UPLOADED, DONE, FAILED] = ['READING', 'WAITING', 'UPLOADING', 'UPLOADED', 'DONE', 'FAILED']

const initFile = {
  blob: null,
  url: '',
  name: '',
  progress: 100,
  serverUrl: '',
  serverId: 0,
  serverImage: null,
  status: DONE,
  type: 'image',
  size: 0,
  message: ''
}
/**
 * @param {object} props
 * @param {string} props.remotePath - remote dir path
 * @param {boolean} props.removeOnServer - remove server item
 * @param {int} props.max - multiple max files
 * @param {function} props.onChange listener files change
 * @returns {React.Component}
 */
export default function Uploader({ 
  defaultValue = [], remotePath = '', max = 10, 
  onChange = _ => _,
  onRemove = _ => false,
  thumbSize = 60,
  disabled = false
}) {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [files, setFiles] = useState([])

  const [loadings, setLoadings] = useState([]);
  const [actionShow, setActionShow] = useState(-1);
  const [preview, setPreview] = useState(-1);

  useEffect(() => {
    setLoadings([ ...defaultValue.map(t => false)])
    setFiles([
      ...defaultValue.map(f => ({
        ...cloneDeep(initFile),
        url: f.url,
        name: f.name || (f?.url || f?.image_url || '').split('/').reverse()[0],
        progress: 100,
        serverUrl: f.url,
        serverId: f.id,
        serverImage: { ...f },
      }) )
    ])
  }, []);


  const handleFileSelect = useCallback(e => {
    setActionShow(-1);
    const newFiles = Array.from(e.target.files).map(file => {
      return {
        ...cloneDeep(initFile),
        blob: file,
        url: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
        name: file.name,
        progress: 0,
        status: READING,
        size: file.size,
      }
    })
    setLoadings(prev => prev.concat( newFiles.map(t => true) ))
    setFiles(prev => prev.concat(newFiles));
  }, [])

  useEffect(() => { onChange(files) }, [files])

  useEffect(() => {
    files.forEach((file, i) => {
      if (file.status === READING) {
        file.status = WAITING
        const reader = new FileReader();
        reader.readAsDataURL(file.blob);
        reader.onloadend = () => {
          updateFileByIndex({ url: reader.result, status: WAITING }, i)
        };
        reader.onerror = () => {
          updateFileByIndex({ status: FAILED, message: 'un suported file !' }, i)
        }
      }
        // remove last
      if (preview > -1 && files.length === preview) {
        setPreview(_ => files.length - 1)
      }
    })
  }, [files.length])


  /**
   * @param {number} index - -1: remove all
   * @param {boolean} set = - should setFiles & setLoadings, default true
   */
  const handleFileRemove = useCallback(async (index, set = true) => {

    if (index === -1) {
      files.map((f, i) => handleFileRemove(i, false));
      delay(0).then(_ => {
        setLoadings(_ => [])
        setFiles(_ => [])
      })
      return;
    }
    
    const file = files[index];
    console.log(files, preview, file)
    if (set) {
      setLoadings(prev => prev.filter((t, i) => i !== index))
      setFiles(prev => prev.filter((t, i) => i !== index))
    }

    const dontRemoveOnserver = onRemove(file, files)

    console.log(dontRemoveOnserver)

    if (!dontRemoveOnserver && file.status === DONE && file.serverUrl) {
     
      try {
        await axiosInstance.delete('/api/tools/deleteFile', {
          params: files.serverId
            ? { imageId: file.serverId }
            : { filename: encodeURIComponent(file.serverUrl) }
        })
      } catch(e) {}
    }
  }, [files])

  const updateFileByIndex = useCallback((data, index) => {
    setFiles(_ => {
      
      Object.keys(data).forEach(k => {
        files[index][k] = data[k]
      })
      return [...files]
    })
    loadings[index] = data.status === UPLOADING || data.status === READING
    setLoadings(_ => [...loadings])
  }, [files])

  const handleUpload = useCallback(() => {
    files.forEach((file, index) => {
      if (file.status === WAITING || file.status === FAILED) {
        axiosInstance.upload('/api/tools/upload', {
          path: remotePath,
          file: file.blob
        }, {
          onUploadProgress: upload => {
            const progress = parseInt(((upload.loaded / upload.total) * 100) | 0);
            updateFileByIndex({ progress, status: UPLOADING }, index)
          }
        }).then(res => {
          updateFileByIndex({ serverUrl: res.path, serverImage: res.image, status: UPLOADED, message: '', serverId: res.image?.id || 0 }, index)
          return delay(1200)
        }).then(_ => {
          updateFileByIndex({ status: DONE }, index)
        }).catch(e => {
          updateFileByIndex({ status: FAILED, message: e?.message || 'upload failed' }, index)
        })
      }
    })
  }, [files])

  const MaskWrapper = ({children, ...props}) => (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} transition={'all .2s'}
       width={'100%'} height={'100%'} cursor="loading" position={'absolute'} top={0} left={0} zIndex={2}
       {...props}
       >
      {children}
    </Box>
  )

  const thumbWidth = (typeof thumbSize === 'object' ? (thumbSize?.width || thumbSize[0]) : thumbSize) ?? 60
  const thumbHeight = (typeof thumbSize === 'object' ? (thumbSize?.height || thumbSize[1]) : thumbSize) ?? 60

  return (<>
    <Box>
      { !disabled && <Box display={'flex'} gap={'10px'} mb={2}>
          <Button
            component="label"
            color='info'
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<SelectAllRounded />}
            disabled={ files.length >= max }
            >
            Select File
            <VisuallyHiddenInput type="file" accept="image/*" multiple={ max - files.length } onChange={handleFileSelect}/>
          </Button>

          { files.find(t => t.status !== UPLOADED && t.status !== DONE) && 
            <Button startIcon={<CloudUpload />} variant='contained' color='warning' onClick={handleUpload}>
              Upload
            </Button>
          }
          { !!files.length && <Button variant='outlined' color="error" startIcon={ <Delete/>  } onClick={ e => handleFileRemove(-1) }>All</Button> }
        </Box>
      }
      <Box gap={'6px'} display={'flex'}>
        { files.map((f, index) => (
          <Box sx={{ position: 'relative' }} key={index}>
            <Badge badgeContent={ {[WAITING]: '⏱', [UPLOADED]: '✅', [FAILED]: '💔'}[f.status] } color={ {[WAITING]: 'secondary', [UPLOADED]: 'success', [FAILED]: 'error'}[f.status] } sx={{ "& .MuiBadge-badge": { right: "50%", zIndex: 3 } }}>
              <Tooltip title={f.message}>
              { f.type === 'image' 
                ? <Avatar src={ asset(f.url) } variant="rounded" sx={{ width: thumbWidth, height: thumbHeight }} slotProps={{ img: { onError: console.error } }}> <AddPhotoAlternate/> </Avatar>
                : <Avatar sx={{ bgcolor: colors.grey[300], width: thumbWidth, height: thumbHeight }} variant="rounded"> <AddPhotoAlternate/> </Avatar>
              }
              </Tooltip>
            </Badge>

            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} width={'100%'} height={'100%'} cursor={'pointer'}
              onMouseEnter={e => setActionShow(_ => index)}
              onMouseLeave={e => setActionShow(_ => -1)}
              >
              { f.status === UPLOADING || loadings[index]
                ? <MaskWrapper backgroundColor={"rgba(0, 0, 0, .6)"}>
                    <CircularProgress color='secondary' value={f.progress} />
                  </MaskWrapper>
                : <MaskWrapper gap={'8px'} pt="10px"
                    sx={{ 
                      cursor: 'pointer', transition: 'all .2s',
                      "&:hover": { backgroundColor: 'rgba(0, 0, 0, .6)', width: '100%', height: "100%" }
                    }}
                    >
                    { actionShow === index && <> 
                      { !disabled && <Delete color='error' onClick={ e => handleFileRemove(index) }/> }
                      <Preview color='info' onClick={ e => { setActionShow(false);setPreview(index)} }/> 
                    </>
                    }
                  </MaskWrapper>
              }
            </Box>
          </Box>
        )) }
      </Box>
    </Box>

    <ImagePreview files={files} onClose={e => setPreview(-1) } currentIndex={preview} onRemove={ !disabled && handleFileRemove }/>
  </>);
}