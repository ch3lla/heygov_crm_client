import { createToast } from 'vercel-toast'

export const toast = {
  success: (message: string) => {
    return createToast(message, {
      timeout: 3000
    })
  },

  error: (message: string) => {
    return createToast(message, {
      type: 'error',
      timeout: 5000
    })
  },

  info: (message: string) => {
    return createToast(message, {
      timeout: 5000
    })
  },

  deleteWithUndo: (
    message: string,
    onUndo: () => void,
    duration: number = 5000
  ) => {
    return createToast(message, {
      timeout: duration,
      action: {
        text: 'Undo',
        callback: (toast) => {
          onUndo()
          toast.destroy()
        }
      }
    })
  }
}

