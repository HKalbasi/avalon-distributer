'use client'

import { useState } from 'react'
import CryptoJS from 'crypto-js'
import Dialog from '../common/Dialog.tsx'
import { useDialog } from '../../hooks/useDialog.tsx'

const encryptMessageWithCryptoJS = (message: string, password: string) => {
  const ciphertext = btoa(CryptoJS.AES.encrypt(message, password).toString())
  return ciphertext
}

const copyToClipboardFallback = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard.', err)
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

export const EncryptGameInfo = ({ textToEncrypt }: any) => {
  const [showAlert, setShowAlert] = useState(false)
  const [copied, setCopied] = useState(false)
  const { dialogState, closeDialog, showSuccess, showError } = useDialog()

  const encrypt = () => {
    try {
      return encryptMessageWithCryptoJS(JSON.stringify(textToEncrypt), 'i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG')
    } catch (error) {
      showError('Encryption failed: ' + error)
      return 'Encryption error'
    }
  }

  const handleClick = async (winner: string) => {
    textToEncrypt.game_info.winner = winner
    const encryptedText = encrypt()
    
    if (encryptedText === 'Encryption error') {
      return
    }
    
    // Save to game history
    const gameType = textToEncrypt.game_info.game_type || 'Avalon'
    const players = Object.keys(textToEncrypt.players)
    const seed = textToEncrypt.game_info.game_seed
    
    const history = JSON.parse(localStorage.getItem('gameHistory') ?? '[]')
    const newGame = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      gameType,
      players,
      winner,
      seed
    }
    history.unshift(newGame)
    if (history.length > 20) history.pop()
    localStorage.setItem('gameHistory', JSON.stringify(history))
    
    let copySuccess = false
    
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(encryptedText)
        copySuccess = true
      } catch {
        copySuccess = copyToClipboardFallback(encryptedText)
      }
    } else {
      copySuccess = copyToClipboardFallback(encryptedText)
    }
    
    if (copySuccess) {
      setCopied(true)
      await showSuccess('Game result encrypted and copied to clipboard!', 'Success')
      setTimeout(() => {
        setCopied(false)
        setShowAlert(false)
      }, 500)
    } else {
      await showError('Failed to copy to clipboard. Please try again.')
    }
  }

  return (
    <>
      <button 
        className='w-full py-3 px-4 rounded-xl font-medium text-white transition-all hover:scale-105'
        style={{ backgroundColor: '#1abc9c' }}
        onClick={() => setShowAlert(true)}
      >
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-5 h-5 inline mr-2'>
          <path fillRule='evenodd' d='M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z' clipRule='evenodd' />
        </svg>
        Save Encrypted Game Result
      </button>

      {showAlert && !copied && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4'>
          <div className='bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full animate-slide-in'>
            <h2 className='text-2xl font-bold mb-6 text-center' style={{ color: '#2c3e50' }}>
              Who won the game?
            </h2>
            <div className='space-y-3'>
              <button 
                onClick={() => handleClick('Good/Liberal')} 
                className='w-full py-4 px-6 rounded-xl font-medium text-white transition-all hover:scale-105 flex items-center justify-center'
                style={{ backgroundColor: '#1abc9c' }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6 mr-2'>
                  <path fillRule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z' clipRule='evenodd' />
                </svg>
                Good/Liberal Wins
              </button>
              
              <button 
                onClick={() => handleClick('Merlin Assassinated')} 
                className='w-full py-4 px-6 rounded-xl font-medium text-white bg-orange-500 transition-all hover:scale-105 hover:bg-orange-600 flex items-center justify-center'
              >
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6 mr-2'>
                  <path fillRule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h.75a.75.75 0 0 0 0-1.5H9Zm6.75.75a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 .75-.75ZM12 17.25a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Z' clipRule='evenodd' />
                </svg>
                Merlin Assassinated
              </button>
              
              <button 
                onClick={() => handleClick('Evil/Fascist')} 
                className='w-full py-4 px-6 rounded-xl font-medium text-white bg-red-500 transition-all hover:scale-105 hover:bg-red-600 flex items-center justify-center'
              >
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6 mr-2'>
                  <path fillRule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm-4.34 7.964a.75.75 0 0 1-1.061-1.06 5.236 5.236 0 0 1 3.73-1.538 5.236 5.236 0 0 1 3.695 1.538.75.75 0 1 1-1.061 1.06 3.736 3.736 0 0 0-2.639-1.098 3.736 3.736 0 0 0-2.664 1.098Z' clipRule='evenodd' />
                </svg>
                Evil/Fascist Wins
              </button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t' style={{ borderColor: '#bdc3c7' }}></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white' style={{ color: '#bdc3c7' }}>OR</span>
                </div>
              </div>

              <button 
                onClick={() => setShowAlert(false)} 
                className='w-full py-3 px-6 rounded-xl font-medium transition-all hover:scale-105 border-2'
                style={{ borderColor: '#bdc3c7', color: '#2c3e50' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Component */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
      />
    </>
  )
}

export default EncryptGameInfo