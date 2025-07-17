"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

const encryptMessageWithCryptoJS = (message: string, password: string) => {
  // AES encrypt with password
  const ciphertext = btoa(CryptoJS.AES.encrypt(message, password).toString());
  return ciphertext;
}

const copyToClipboardFallback = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    // alert("Encrypted game info copied to clipboard!");
  } catch (err) {
    alert("Failed to copy to clipboard." + err);
  }
  document.body.removeChild(textarea);
}

export const EncryptGameInfo = ({ textToEncrypt }: any) => {
  const [showAlert, setShowAlert] = useState(false);

  const encrypt = () => {
    try {
      return encryptMessageWithCryptoJS(
        JSON.stringify(textToEncrypt),
        "i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG"
      );
    } catch (error) {
      alert("Encryption failed: " + error);
      return "Encryption error";
    }
  };

  const handleClick = (winner: String) => {
    textToEncrypt.game_info.winner = winner;
    const encryptedText = encrypt()
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(encryptedText)
        .then(() => alert("Encrypted game info copied to clipboard!"))
        .catch(() => copyToClipboardFallback(encryptedText));
    } else {
      copyToClipboardFallback(encryptedText);
    }
    setShowAlert(false);
  };

  return (
    <div>
      <button onClick={() => setShowAlert(true)} >
        Encrypt & Copy Game Info
      </button>

      {showAlert && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="p-6 rounded-xl shadow-lg space-y-4 text-center">
            <h2 className="text-lg font-bold">Who is the winner?</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleClick("Shar")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Shar
              </button>
              <button
                onClick={() => handleClick("Merlin Shot")}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Merlin Shot
              </button>
              <button
                onClick={() => handleClick("3 Fail")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                3 Fail
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default EncryptGameInfo;