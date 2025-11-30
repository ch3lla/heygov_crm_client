import { createToast } from 'vercel-toast'

export const toast = {
  success: (message: string) => {
    createToast(message, {
      type: 'success',
      timeout: 5000
    })
  },

  successWithUndo: (
    message: string,
    onUndo: () => void,
    duration: number = 5000
  ) => {
    createToast(message, {
      timeout: duration,
      action: {
        text: 'Undo',
        callback: (toast) => {
          onUndo()
          toast.destroy()
        }
      }
    })
  },

  error: (message: string) => {
    createToast(message, {
      type: 'error',
      timeout: 7000
    })
  },

  info: (message: string) => {
    createToast(message, {
      timeout: 5000
    })
  },

  deleteWithUndo: (
    message: string,
    onUndo: () => void,
    duration: number = 5000
  ) => {
    createToast(message, {
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

