# config.py (UPDATED)

import os
from dotenv import load_dotenv

load_dotenv(".env")

class Config:
    API_ID = int(os.environ.get("API_ID", 0))
    API_HASH = os.environ.get("API_HASH", "")
    BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
    OWNER_ID = int(os.environ.get("OWNER_ID", 0))
    
    _storage_channel_str = os.environ.get("STORAGE_CHANNEL")
    if _storage_channel_str:
        try: STORAGE_CHANNEL = int(_storage_channel_str)
        except ValueError: STORAGE_CHANNEL = _storage_channel_str
    else: STORAGE_CHANNEL = 0
    
    _base_url_env = os.environ.get("BASE_URL", "").rstrip('/')
    if os.name == 'nt' or os.environ.get("LOCAL_DEV") == "true":
        _port = int(os.environ.get("PORT", 8000))
        BASE_URL = f"http://127.0.0.1:{_port}"
    else:
        BASE_URL = _base_url_env
    DATABASE_URL = os.environ.get("DATABASE_URL", "")
    REDIRECT_BLOGGER_URL = os.environ.get("REDIRECT_BLOGGER_URL", "")
    BLOGGER_PAGE_URL = os.environ.get("BLOGGER_PAGE_URL", "")
    
    # --- YAHAN BADLAV KIYA GAYA HAI ---
    # Force Subscribe ke liye channel ID/username
    _fsub_channel_str = os.environ.get("FORCE_SUB_CHANNEL")
    if _fsub_channel_str:
        try: FORCE_SUB_CHANNEL = int(_fsub_channel_str)
        except ValueError: FORCE_SUB_CHANNEL = _fsub_channel_str
    else: FORCE_SUB_CHANNEL = 0
        
    # Yeh bot ka username store karega (code isse automatic set karega)
    BOT_USERNAME = ""
    
    # Log Channel for all bot activity
    LOG_CHANNEL = int(os.environ.get("LOG_CHANNEL", -1003741324316))
    
    # API key to control setplan externally
    PAYMENT_API_KEY = os.environ.get("PAYMENT_API_KEY", "Univora_SecureKey_12345")
    
    # Domains allowed to embed the video. Comma-separated in .env
    ALLOWED_EMBED_DOMAINS = [d.strip() for d in os.environ.get("ALLOWED_EMBED_DOMAINS", "").split(",") if d.strip()]
