import { useCallback } from "react";
import { enqueueSnackbar } from 'notistack';

function useToast(options = {}) {

  /**
   * @param {string} message
   * @param {number|string} state -1.error 0.warning 1.success
   */
  const toast = useCallback((message, state = options.state || 0) => {
    const variant = ['error', 'warning', 'success'][state + 1] || state
    enqueueSnackbar(message, { 
      variant, 
      autoHideDuration: 3000,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center'
      },
      ...options
    })
  }, [])

  return toast
}

export default useToast