"use client";

import { useState, useEffect } from "react";
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

export const EncryptGameInfo = ({ textToEncrypt }: { textToEncrypt: string }) => {
  const [encryptedText, setEncryptedText] = useState<string>("");
  useEffect(() => {
    const encrypt = async () => {
      try {
        const result = encryptMessageWithCryptoJS(
          textToEncrypt,
          "i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG"
        );
        setEncryptedText(result);
      } catch (error) {
        alert("Encryption failed: " + error);
        setEncryptedText("Encryption error");
      }
    };

    encrypt();
  }, [textToEncrypt]);

  return (
    <div>
      <button onClick={() => {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(encryptedText)
              .then(() => alert("Encrypted game info copied to clipboard!"))
              .catch(() => copyToClipboardFallback(encryptedText));
          } else {
            copyToClipboardFallback(encryptedText);
          }
      }}>
        Encrypt & Copy Game Info
      </button>
    </div>
  );
};

export default EncryptGameInfo;