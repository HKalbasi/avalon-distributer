'use client'

import { useState } from 'react'
import CryptoJS from 'crypto-js'

const encryptMessageWithCryptoJS = (message: string, password: string) => {
  // AES encrypt with password
  const ciphertext = btoa(CryptoJS.AES.encrypt(message, password).toString())
  return ciphertext
}

const copyToClipboardFallback = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in MS Edge.
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
    // alert("Encrypted game info copied to clipboard!");
  } catch (err) {
    alert('Failed to copy to clipboard.' + err)
  }
  document.body.removeChild(textarea)
}

export const EncryptGameInfo = ({ textToEncrypt }: any) => {
  const [showAlert, setShowAlert] = useState(false)

  const encrypt = () => {
    try {
      return encryptMessageWithCryptoJS(JSON.stringify(textToEncrypt), 'i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG')
    } catch (error) {
      alert('Encryption failed: ' + error)
      return 'Encryption error'
    }
  }

  const handleClick = (winner: string) => {
    textToEncrypt.game_info.winner = winner
    const encryptedText = encrypt()
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(encryptedText)
        .then(() => alert('Encrypted game info copied to clipboard!'))
        .catch(() => copyToClipboardFallback(encryptedText))
    } else {
      copyToClipboardFallback(encryptedText)
    }
    setShowAlert(false)
  }

  return (
    <div>
      <button className='btn btn-dash btn-primary' onClick={() => setShowAlert(true)}>
        Encrypt & Copy Game Info
      </button>

      {showAlert && (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-base-200 z-50'>
          <div className='p-6 rounded-xl shadow-lg space-y-4 text-center'>
            <h2 className='text-lg font-bold'>Who is the winner?</h2>
            <div className='flex flex-col gap-2'>
              <button onClick={() => handleClick('shahr')} className='btn btn-dash btn-success'>
                Shahr
              </button>
              <button onClick={() => handleClick('merlin shot')} className='btn btn-dash btn-warning'>
                Merlin Shot
              </button>
              <button onClick={() => handleClick('3 fail')} className='btn btn-dash btn-error'>
                3 Fail
              </button>

              <button onClick={() => setShowAlert(false)} className='btn btn-dash'>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='size-4'>
                  <path
                    fill-rule='evenodd'
                    d='M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z'
                    clip-rule='evenodd'
                  />
                </svg>
                back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EncryptGameInfo
