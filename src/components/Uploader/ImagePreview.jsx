import { useEffect, useState } from 'react';
import { Box, Dialog, ImageList, ImageListItem, ImageListItemBar, useTheme } from '@mui/material';
import { Delete, ErrorOutline } from '@mui/icons-material';
import { asset } from 'src/utils/Utils'
import { tokens } from 'src/theme';

/**
 * @param {object} props.files { url, name }
 * @param {function} onClose when closed, your should remove currentIndex
 * @param {number} currentIndex when >= 0 will be open
 * @returns 
 */
export default function ImagePreview({ files = [], onClose = e => null, currentIndex = -1, onRemove }) {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [file, setFile] = useState(files[currentIndex]);

  useEffect(() => {
    files.forEach(f => {
      if (f.loadState !== 1) {
        f.loadState = 0; 
        const img = new Image()
        img.src = asset(f.url)
        
        img.onerror = () => {
          f.loadState = -1
        }
        img.onload = () => {
          f.loadState = 1
        }
      }
    })
    
    if (files[currentIndex]) {
      setFile(_ => ({ index: currentIndex, ...files[currentIndex] }))
    } else {
      onClose()
    }
  }, [files, currentIndex])

  return (
    <Dialog sx={{ "& .MuiDialog-paper": { top: "-5vh", backgroundColor: "transparent", backgroundImage: "none", boxShadow: 'none' } }}
      open={files.length && currentIndex > -1} 
      onClose={ (e, reason) => ['backdropClick', 'escapeKeyDown'].includes(reason) && onClose() }
      >
      <ImageList sx={{ width: 500 }} cols={1}>
        { file && 
          <ImageListItem key={-1} cols={1} rows={1}>
            <div
              style={{ 
                width: 500, height: 540, 
                backgroundImage: `url(${ file.url })`, backgroundSize: "contain", backgroundRepeat: 'no-repeat', backgroundPosition: "center",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: file.loadState === -1 ? '1px solid rgba(255, 0, 0, .2)' : `none`,
                backgroundColor: colors.grey[200]
              }}
              alt={file.name}
              loading="lazy"
            >
              { file.loadState === -1 && <ErrorOutline size="30px"/> }
            </div>
            { file.name && <ImageListItemBar title={file.name} 
              actionIcon={
                typeof onRemove === 'function' && <Box gap={2} sx={{ marginRight: '10px', cursor: 'pointer' }}>
                  <Delete color='error' onClick={e => onRemove(currentIndex) }/> 
                </Box>
              }
            />
            }
          </ImageListItem>
        }
      </ImageList>
      
      <Box display={'flex'} justifyContent={'center'} sx={{ width: 500, height: 80 }} gap={'2px'}>
        {files.map((item, index) => (
          <Box key={index} 
            sx={{ 
              background: `url(${ item.url }) no-repeat center`, backgroundSize: "cover" ,
              width: 80, height: 80, cursor: 'pointer', 
              transition: 'all .1s',
              border: `4px solid ${file?.index === index ? colors.blueAccent[700] : 'transparent' }`, 
            }}
            onClick={e => setFile(_ => ({ index, ...item }))}
          />
        ))}
      </Box>
    </Dialog>
  )
}