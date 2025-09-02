import { useState, useCallback } from 'react'

interface DialogOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'prompt'
  confirmText?: string
  cancelText?: string
  placeholder?: string
  defaultValue?: string
}

export const useDialog = () => {
  const [dialogState, setDialogState] = useState<
    DialogOptions & { isOpen: boolean; onConfirm?: (value?: string) => void }
  >({
    isOpen: false,
    message: '',
    type: 'info',
  })

  const showDialog = useCallback((options: DialogOptions): Promise<string | boolean> => {
    return new Promise(resolve => {
      setDialogState({
        ...options,
        isOpen: true,
        onConfirm:
          options.type === 'confirm'
            ? () => resolve(true)
            : options.type === 'prompt'
              ? (value?: string) => resolve(value || '')
              : undefined,
      })

      if (options.type !== 'confirm' && options.type !== 'prompt') {
        resolve(true)
      }
    })
  }, [])

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
    // For prompt dialogs, resolve with empty string when closed
    if (dialogState.type === 'prompt') {
      return ''
    }
  }, [dialogState.type])

  const showInfo = useCallback(
    (message: string, title?: string) => {
      return showDialog({ message, title, type: 'info' })
    },
    [showDialog],
  )

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      return showDialog({ message, title, type: 'success' })
    },
    [showDialog],
  )

  const showError = useCallback(
    (message: string, title?: string) => {
      return showDialog({ message, title, type: 'error' })
    },
    [showDialog],
  )

  const showWarning = useCallback(
    (message: string, title?: string) => {
      return showDialog({ message, title, type: 'warning' })
    },
    [showDialog],
  )

  const confirm = useCallback(
    (message: string, title?: string): Promise<boolean> => {
      return showDialog({ message, title, type: 'confirm' }) as Promise<boolean>
    },
    [showDialog],
  )

  const prompt = useCallback(
    (message: string, title?: string, placeholder?: string, defaultValue?: string): Promise<string> => {
      return showDialog({ message, title, type: 'prompt', placeholder, defaultValue }) as Promise<string>
    },
    [showDialog],
  )

  return {
    dialogState,
    closeDialog,
    showInfo,
    showSuccess,
    showError,
    showWarning,
    confirm,
    prompt,
  }
}
