import os
import base64

from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

load_dotenv()

KEY = os.getenv("ENCRYPTION_KEY")
if not KEY:
    raise ValueError("ENCRYPTION_KEY is missing from .env")

try:
    KEY = base64.urlsafe_b64decode(KEY)
except Exception:
    raise ValueError("ENCRYPTION_KEY is not valid Base64")

if len(KEY) != 32:
    raise ValueError("ENCRYPTION_KEY must decode to exactly 32 bytes")


def encrypt_data(text):
    """
    Encrypt text using AES-256-GCM.
    Returns Base64 encoded encrypted data.
    """

    if text is None:
        return None

    text = str(text)

    nonce = os.urandom(12)

    encrypted = AESGCM(KEY).encrypt(
        nonce,
        text.encode("utf-8"),
        None
    )

    result = nonce + encrypted

    return base64.urlsafe_b64encode(result).decode("utf-8")


def decrypt_data(encrypted_text):
    """
    Decrypt AES-256-GCM encrypted text.
    """

    if not encrypted_text:
        return None

    try:
        raw = base64.urlsafe_b64decode(
            encrypted_text.encode("utf-8")
        )

        nonce = raw[:12]
        ciphertext = raw[12:]

        decrypted = AESGCM(KEY).decrypt(
            nonce,
            ciphertext,
            None
        )

        return decrypted.decode("utf-8")

    except Exception as e:
        print("Decryption error:", e)
        raise ValueError("Unable to decrypt data")