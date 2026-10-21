import os
import json
import tempfile
from threading import RLock
from datetime import datetime

from encryption import encrypt_data, decrypt_data


CHAT_FILE = os.path.join(
    os.path.dirname(__file__),
    "chat_data.json"
)

_CHAT_LOCK = RLock()


def load_chat_file():

    if not os.path.exists(CHAT_FILE):
        return []

    try:
        with open(
            CHAT_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

            if not isinstance(data, list):
                raise ValueError("Chat storage must contain a JSON array")

            if not all(isinstance(chat, dict) for chat in data):
                raise ValueError("Chat storage contains an invalid record")

            return data

    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError("Encrypted chat storage is unavailable or corrupted") from exc


def save_chat_file(data):
    directory = os.path.dirname(CHAT_FILE)
    descriptor, temp_file = tempfile.mkstemp(
        prefix="chat_data_",
        suffix=".tmp",
        dir=directory,
        text=True
    )

    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2)
            file.flush()
            os.fsync(file.fileno())

        os.replace(temp_file, CHAT_FILE)
    except OSError:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise


def get_all_chat_records():
    with _CHAT_LOCK:
        return load_chat_file()


def get_chat_by_id(chat_id):
    with _CHAT_LOCK:
        for chat in load_chat_file():
            if str(chat.get("id")) == str(chat_id):
                return chat
    return None


def delete_chat(chat_id, user_id=None):
    with _CHAT_LOCK:
        chats = load_chat_file()
        remaining = []
        deleted = False

        for chat in chats:
            if str(chat.get("id")) != str(chat_id):
                remaining.append(chat)
                continue

            if user_id is not None:
                stored_user_id = decrypt_data(chat.get("user_id"))
                if str(stored_user_id) != str(user_id):
                    remaining.append(chat)
                    continue

            deleted = True

        if deleted:
            save_chat_file(remaining)

        return deleted


def get_chat_count():
    with _CHAT_LOCK:
        return len(load_chat_file())


def save_chat(
    user_id,
    provider,
    user_message,
    ai_response
):

    with _CHAT_LOCK:
        chats = load_chat_file()
        numeric_ids = [
            int(chat["id"])
            for chat in chats
            if str(chat.get("id", "")).isdigit()
        ]
        next_id = max(numeric_ids, default=0) + 1

        chats.append({
            "id": next_id,
            "user_id": encrypt_data(user_id),
            "provider": encrypt_data(provider),
            "user_message": encrypt_data(user_message),
            "ai_response": encrypt_data(ai_response),
            "created_at": encrypt_data(datetime.utcnow().isoformat())
        })

        save_chat_file(chats)


def get_chat_summaries():
    summaries = []

    for chat in get_all_chat_records():
        try:
            summaries.append({
                "id": chat.get("id"),
                "provider": decrypt_data(chat.get("provider")),
                "created_at": decrypt_data(chat.get("created_at")),
                "encrypted_user_message": chat.get("user_message"),
                "encrypted_ai_response": chat.get("ai_response"),
                "encrypted": True
            })
        except ValueError as exc:
            raise RuntimeError("Encrypted chat storage contains an invalid record") from exc

    return summaries


def decrypt_chat_record(chat):
    if not chat:
        raise ValueError("Chat record not found")

    user_id = decrypt_data(chat.get("user_id"))
    provider = decrypt_data(chat.get("provider"))
    message = decrypt_data(chat.get("user_message"))
    response = decrypt_data(chat.get("ai_response"))
    created_at = decrypt_data(chat.get("created_at"))

    if user_id is not None:
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            pass

    return {
        "id": chat.get("id"),
        "user_id": user_id,
        "provider": provider,
        "user_message": message,
        "ai_response": response,
        "created_at": created_at
    }


def get_user_chats(user_id):

    chats = get_all_chat_records()

    result = []

    for chat in chats:

        try:

            stored_user_id = decrypt_data(
                chat["user_id"]
            )

            if str(stored_user_id) != str(user_id):
                continue

            result.append({

                "id":
                    chat["id"],

                "provider":
                    decrypt_data(
                        chat["provider"]
                    ),

                "userMessage":
                    decrypt_data(
                        chat["user_message"]
                    ),

                "aiResponse":
                    decrypt_data(
                        chat["ai_response"]
                    ),

                "createdAt":
                    decrypt_data(
                        chat["created_at"]
                    )
            })

        except Exception as e:

            print(
                "Chat decryption error:",
                e
            )

    return result