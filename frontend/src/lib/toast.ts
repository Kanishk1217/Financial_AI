import { toast as sonner } from 'sonner'

type ToastOpts = { id?: string | number; description?: string; duration?: number }

export const toast = {
  success: (msg: string, opts?: ToastOpts) => sonner.success(msg, opts),
  error:   (msg: string, opts?: ToastOpts) => sonner.error(msg, opts),
  info:    (msg: string, opts?: ToastOpts) => sonner(msg, opts),
  loading: (msg: string, opts?: ToastOpts) => sonner.loading(msg, opts),
  dismiss: (id?: string | number) => sonner.dismiss(id),
  /**
   * Undoable action toast.
   * Shows "msg · Undo" for `duration` ms. If user clicks Undo before timeout,
   * onUndo() is called and the action is reversed (caller's responsibility).
   * Returns a promise that resolves true if undo was clicked, false if it timed out.
   */
  undoable: (msg: string, onUndo: () => void, duration = 5000): Promise<boolean> => {
    return new Promise(resolve => {
      let undone = false
      const id = sonner(msg, {
        duration,
        action: {
          label: 'Undo',
          onClick: () => {
            undone = true
            onUndo()
            resolve(true)
          },
        },
        onDismiss: () => { if (!undone) resolve(false) },
        onAutoClose: () => { if (!undone) resolve(false) },
      })
      void id
    })
  },
}
