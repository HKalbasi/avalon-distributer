import { useState, useEffect } from 'react'
import Dialog from '../components/common/Dialog'
import { useDialog } from '../hooks/useDialog'

interface InitialSetupProps {
  onComplete: (name: string) => void
}

const InitialSetup = ({ onComplete }: InitialSetupProps) => {
  const { dialogState, closeDialog, prompt } = useDialog()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkName = async () => {
      const existingName = localStorage.getItem('me')
      if (!existingName && !isReady) {
        setIsReady(true)
        const name = await prompt(
          'Welcome! Please enter your name to get started.',
          'Setup Your Profile',
          'Your name...',
          'player'
        )
        if (name) {
          onComplete(name.toLowerCase())
        } else {
          onComplete('player')
        }
      }
    }
    checkName()
  }, [prompt, onComplete, isReady])

  return (
    <Dialog
      isOpen={dialogState.isOpen}
      onClose={closeDialog}
      title={dialogState.title}
      message={dialogState.message}
      type={dialogState.type}
      onConfirm={dialogState.onConfirm}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      placeholder={dialogState.placeholder}
      defaultValue={dialogState.defaultValue}
    />
  )
}

export default InitialSetup