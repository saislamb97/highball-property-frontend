import { Box, Menu, MenuItem, Typography, Divider } from '@mui/material';

export default function HeadingPicker({ value, anchorEl, onClose = _ => _, onChange = _ => _, ...props }) {
  const open = Boolean(anchorEl)
  const prefix = 'heading'
  return (
    <Menu component="nav"
      id={ `${prefix}-menu` }
      MenuListProps={{
        'aria-labelledby': `${prefix}-button`,
      }}
      anchorEl={anchorEl} open={open}
      onClose={ onClose }
      >
      { <Box display={'flex'} flexDirection={'column'} cursor="pointer">
          <MenuItem onClick={ e => { onClose(e); onChange(0) } }>normal</MenuItem>
          <Divider/>
          { [1,2,3,4,5,6].map(h => 
            <MenuItem key={h}>
              <Typography variant={'h' + h} style={{ cursor: 'pointer',  }} 
                onClick={ e => { onClose(e); onChange(h) } }
                >Heading {h}</Typography>
            </MenuItem>
          )}
          
        </Box>
      }
      </Menu>
  )
}