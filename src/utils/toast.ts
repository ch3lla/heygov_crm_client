import { createToast } from 'vercel-toast'

export const toast = {
  success: (message: string) => {
    return createToast(message, {
      timeout: 3000,
      action: {
        text: '✕',
        callback: (toast) => {
          toast.destroy()
        }
      }
    })
  },

  error: (message: string) => {
    return createToast(message, {
      type: 'error',
      timeout: 5000,
      action: {
        text: '✕',
        callback: (toast) => {
          toast.destroy()
        }
      }
    })
  },

  info: (message: string) => {
    return createToast(message, {
      timeout: 5000,
      action: {
        text: '✕',
        callback: (toast) => {
          toast.destroy()
        }
      }
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
      },
      cancel: '✕' // Add close button alongside undo
    })
  }
}

