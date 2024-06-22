import EmojiPickerReact from 'emoji-picker-react';
import { Box, Popover, useTheme } from '@mui/material';

export default function EmojiPicker({ anchorEl, onChange = _ => _ , onClose = _ => _, ...props }) {
  const open = Boolean(anchorEl)
  const theme = useTheme()
  return (
    <Popover open={open} anchorEl={anchorEl} anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }} 
      { ...props }
      onClose={onClose}
      >
      <Box sx={{ '*': { '--epr-emoji-size': '28px' } }}>
        <EmojiPickerReact height={400} theme={theme.palette.mode} lazyLoadEmojis lazyLoad emojiStyle="native"
          onEmojiClick={ e => { onClose();onChange(e) } }
          />
      </Box>
    </Popover>
  )
}