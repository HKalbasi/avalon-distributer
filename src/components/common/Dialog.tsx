import { useEffect, useRef, useState } from 'react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'prompt'
  onConfirm?: (value?: string) => void
  confirmText?: string
  cancelText?: string
  placeholder?: string
  defaultValue?: string
}

const Dialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  onConfirm, 
  confirmText = 'OK',
  cancelText = 'Cancel',
  placeholder = '',
  defaultValue = ''
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(defaultValue)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Focus trap
      if (type === 'prompt') {
        inputRef.current?.focus()
        inputRef.current?.select()
      } else {
        dialogRef.current?.focus()
      }
      // Reset input value when dialog opens
      setInputValue(defaultValue)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, type, defaultValue])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (type === 'prompt') {
      if (onConfirm) onConfirm(inputValue)
    } else {
      if (onConfirm) onConfirm()
    }
    onClose()
  }

  if (!isOpen) return null

  const icons = {
    info: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    confirm: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    prompt: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  }

  const colors = {
    info: '#1abc9c',
    success: '#1abc9c',
    warning: '#f39c12',
    error: '#e74c3c',
    confirm: '#2c3e50',
    prompt: '#2c3e50'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        ref={dialogRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-slide-in"
        tabIndex={-1}
      >
        <form onSubmit={handleSubmit} className="p-6">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors[type]}20`, color: colors[type] }}
          >
            {icons[type]}
          </div>
          
          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#2c3e50' }}>
              {title}
            </h3>
          )}
          
          {/* Message */}
          <p className="text-center mb-6" style={{ color: '#2c3e50' }}>
            {message}
          </p>
          
          {/* Input field for prompt type */}
          {type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 mb-6 border-2 border-[#bdc3c7]/30 rounded-xl focus:border-[#1abc9c] focus:outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          )}
          
          {/* Buttons */}
          <div className={`flex gap-3 ${(type === 'confirm' || type === 'prompt') ? 'justify-center' : 'justify-center'}`}>
            {(type === 'confirm' || type === 'prompt') && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-medium transition-all hover:scale-105 border-2"
                style={{ borderColor: '#bdc3c7', color: '#2c3e50' }}
              >
                {cancelText}
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-medium text-white transition-all hover:scale-105"
              style={{ backgroundColor: colors[type] }}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dialog