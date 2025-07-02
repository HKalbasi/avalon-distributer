"use client";

import { useState, useEffect } from "react";

type EncryptInfoProps = {
  textToEncrypt: string;
};

async function encryptMessage(message: string, password: string) {
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Convert password to key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(">.r4M@&JXD`|xUG{<W@~"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"],
  );

  // Encrypt the message
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    new TextEncoder().encode(message),
  );

  // Combine IV and ciphertext
  const encrypted = new Uint8Array(iv.length + ciphertext.byteLength);
  encrypted.set(iv, 0);
  encrypted.set(new Uint8Array(ciphertext), iv.length);

  // Convert to Base64
  return btoa(String.fromCharCode(...encrypted));
}

export const EncryptGameInfo = ({ textToEncrypt }: EncryptInfoProps) => {
  // const encryptedText = encryptMessage(
  //   textToEncrypt,
  //   "i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG",
  // );
  const [encryptedText, setEncryptedText] = useState<string>("");

  useEffect(() => {
    const encrypt = async () => {
      try {
        const result = await encryptMessage(
          textToEncrypt,
          "i0sl3VsNfra3yPhkUi1bCqXxsbPgtsMG",
        );
        setEncryptedText(result);
      } catch (error) {
        console.error("Encryption failed:", error);
        setEncryptedText("Encryption error");
      }
    };

    encrypt();
  }, [textToEncrypt]);

  return <div>Game Encrypted Information: ${encryptedText}</div>;
};

export default EncryptGameInfo;
