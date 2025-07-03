"use client";

import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";

function encryptMessageWithCryptoJS(message: string, password: string) {
  // AES encrypt with password
  const ciphertext = CryptoJS.AES.encrypt(message, password).toString();
  return ciphertext;
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
      <h4>Game Encrypted Information:</h4>
      {encryptedText}
    </div>
  );
};

export default EncryptGameInfo;