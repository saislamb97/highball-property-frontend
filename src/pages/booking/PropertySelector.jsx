import { useState, useEffect, useMemo } from "react";
import { debounce } from 'lodash';

import { useTheme, Box, Button, TextField, List, Divider, Menu, MenuItem, CircularProgress  } from "@mui/material";
import { tokens } from "src/theme";
import { useQuery } from "@tanstack/react-query";
import { GetProperties, GetProperty } from "src/services/properties";

export default function PropertySelector({ 
  defaultValue = null, 
  disabled, sx = {}, 
  hideAnchor = false, 
  open = false, 
  anchorEl = null, 
  onClose = e => null, 
  onChange = e => null 
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [property, setProperty] = useState(null);
  
  const [searching, setSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  const { isPending, data = { rows: [] } } = useQuery({
    queryKey: ['properties', keyword],
    queryFn: _ => GetProperties({ page: 1, pageSize: 20, ...(keyword ? { keyword } : {}) })
  })
  useEffect(() => {
    if (data.rows.length) {
      if (defaultValue?.id) {
        const defaultProperty = data.rows.find(t => t.id === defaultValue.id)
        if (!defaultProperty) {
          GetProperty(defaultValue.id).then(res => {
            data.rows.unshift(res)
            setProperty(res)
          })
        } else {
          setProperty(defaultProperty)
        }
      } else {
        const defaultProperty = data.rows[0] || null
        setProperty(defaultProperty)
      }
    }
    setSearching(_ => false)
  }, [data.rows])

  useEffect(() => {
    onChange(property)
  }, [property])

  const handleSearch = e => {
    setSearching(true)
    const debounceFun = debounce(
      _ => setKeyword(e.target.value.trim()),
      1000,
      { maxWait: 1 }
    )
    debounceFun()
  }

  const handleSelect = (t) => {
    if (property?.id !== t.id) {
      setProperty({...t})
      onChange(t)
    }
    setAnchorEle(null)
  }
  const prefix = 'PROPERTY-SELECTOR'

  const [anchorEle, setAnchorEle] = useState(anchorEl)
  useEffect(() => {
    setAnchorEle(anchorEl)
  }, [anchorEl])

  useEffect(() => {
    if (open) {
      setAnchorEle(document.getElementById(`#${prefix}-button`))
    } else {
      setAnchorEle(null)
    }
  }, [open])


  return <Box sx={{sx}}>

    { !hideAnchor && <Button id={ `${prefix}-button` }
        aria-controls={!!anchorEle ? `${prefix}-menu` : undefined}
        aria-haspopup="true"
        onClick={e => !disabled && setAnchorEle(e.currentTarget) } color="secondary" variant="text"
        >
        { property?.property_name || 'Select Property' }
      </Button>
    }

    <Menu component="nav"
      id={ `${prefix}-menu` }
      MenuListProps={{
        'aria-labelledby': `${prefix}-button`,
      }}
      anchorEl={anchorEle} 
      open={ !!anchorEle }
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      onClose={ e => anchorEl ? onClose(e) : setAnchorEle(null) }
      >
      <MenuItem>
        <TextField size="small" label="Search by name" color="info" onChange={handleSearch}/>
      </MenuItem>
      { searching
        ? <Box padding={1} display={'flex'} justifyContent={'center'}> <CircularProgress color="info"/> </Box>
        : data.rows.map((t, i) => 
          <Box key={i} padding={1} sx={{ '& .Mui-selected': { backgroundColor: colors.grey[600] } }}>
            { i > 0 && <Divider/> }

            <MenuItem key={t.id} 
              onClick={e => { onClose(e); handleSelect(t)} }
              selected={property?.id === t.id}
              >
              {t.id}. { t.property_name }
            </MenuItem>
          </Box>
      )}
      { !data.rows.length && !searching && <Box padding={1} textAlign={'center'} color={colors.grey[200]}>No Properties</Box> }
    </Menu>
  </Box>
}