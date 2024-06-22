import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import { ColorModeContext, useMode } from 'src/theme';
import { ThemeProvider } from '@mui/material';

import { Box, Button, colors, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

function Confirm({ 
  title, children, content, loading,
  offsetTop = "-10vh",
  onConfirm = _ => null, 
  onCancel, 
  confirmText,
  confirmColor = 'secondary',
  cancelText,
  form = false,
  open = false,
  ConfirmIcon = <RestartAltIcon />
}) {

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {}
    Array.from(e.target).forEach(el => {
      if (el.name) {
        formData[el.name] = el.value
      }
    })
    if (!e.detail) {
      e.detail = { value: formData }
    } else {
      e.detail.value = formData
    }
    onConfirm(e)
  }
  return (
    <Dialog open={open} sx={{ "& .MuiDialog-paper": { "top": offsetTop } }} maxWidth="90%">
      { title && <Typography variant="h4" textAlign={'center'} padding={2}>{title}</Typography> }
      <form onSubmit={ handleSubmit }>
        <DialogContent>
          <Box p={2}>{content || children}</Box>
        </DialogContent>
        
        <DialogActions>
          <Box
            p={3}
            display="flex"
            justifyContent="flex-end"
            gap="20px"
            >
            {
              !!onCancel && <Button color="inherit" variant="contained" onClick={onCancel}>
                { cancelText || 'Cancel' }
              </Button>
            }

            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={ ConfirmIcon }
              type={ form ? "submit" : "button" }
              color={ confirmColor }
              variant="contained"
              onClick={e => form ? (_ => e) : onConfirm(e)}
              >
              {confirmText || 'Confirm' }
            </LoadingButton>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

Confirm.propTypes = {
  open: PropTypes.bool.isRequired
};
export { Confirm }

const div = document.createElement('div');
div.setAttribute('data-confirm', '')
const confirmRoot = ReactDOM.createRoot(div);
document.body.appendChild(div);

const ThemeWrapper = ({children}) => {
  const [theme, colorMode] = useMode()
  return <ColorModeContext.Provider value={colorMode}>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </ColorModeContext.Provider>
}

export default {
  open(props) {
    confirmRoot.render(
      <ThemeWrapper>
        <Confirm open={true} { ...props }/>
      </ThemeWrapper>
    )
  },
  close() {
    confirmRoot.render(
      <ThemeWrapper>
        <Confirm open={false}/>
      </ThemeWrapper>
    )
  }
}