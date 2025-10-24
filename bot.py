# bot.py (FINAL CODE - No more traceback errors)

import os
import time
import asyncio
import secrets
import traceback
from urllib.parse import urlparse

import aiohttp
import aiofiles
from pyrogram import Client, filters
from pyrogram.errors import FloodWait
from pyrogram.types import Message

from config import Config

# --- Bot Initialization ---
bot = Client(
    "SimpleStreamBot",
    api_id=Config.API_ID,
    api_hash=Config.API_HASH,
    bot_token=Config.BOT_TOKEN,
    workers=100
)

# In-memory dictionaries
multi_clients = {}
work_loads = {}
# YEH NAYI DICTIONARY HAI ID STORE KARNE KE LIYE
link_db = {}


class TokenParser:
    # ... (Yeh poora class same rahega, koi change nahi)
    @staticmethod
    def parse_from_env():
        return {
            c + 1: t
            for c, (_, t) in enumerate(
                filter(lambda n: n[0].startswith("MULTI_TOKEN"), sorted(os.environ.items()))
            )
        }

async def start_client(client_id, bot_token):
    # ... (Yeh poora function same rahega, koi change nahi)
    try:
        print(f"Attempting to start Client: {client_id}")
        client = await Client(
            name=str(client_id), api_id=Config.API_ID, api_hash=Config.API_HASH,
            bot_token=bot_token, sleep_threshold=100, no_updates=True, in_memory=True
        ).start()
        work_loads[client_id] = 0
        multi_clients[client_id] = client
        print(f"Client {client_id} started successfully.")
    except FloodWait as e:
        print(f"FloodWait for Client {client_id}. Waiting for {e.value} seconds...")
        await asyncio.sleep(e.value + 5)
        await start_client(client_id, bot_token)
    except Exception as e:
        print(f"!!! CRITICAL ERROR: Failed to start Client {client_id} - Error: {e}")

async def initialize_clients(main_bot_instance):
    # ... (Yeh poora function same rahega, koi change nahi)
    multi_clients[0] = main_bot_instance
    work_loads[0] = 0
    
    all_tokens = TokenParser.parse_from_env()
    if not all_tokens:
        print("No additional clients found. Using default bot only.")
        return
    
    print(f"Found {len(all_tokens)} extra clients. Starting them one by one with a delay.")
    for i, token in all_tokens.items():
        await start_client(i, token)
        await asyncio.sleep(10)

    if len(multi_clients) > 1:
        print(f"Multi-Client Mode Enabled. Total Clients: {len(multi_clients)}")
    else:
        print("Single Client Mode.")

# --- Helper Functions (Same as before) ---
def get_readable_file_size(size_in_bytes):
    if not size_in_bytes: return '0B'
    power, n = 1024, 0
    power_labels = {0: '', 1: 'K', 2: 'M', 3: 'G'}
    while size_in_bytes >= power and n < len(power_labels):
        size_in_bytes /= power; n += 1
    return f"{size_in_bytes:.2f} {power_labels[n]}B"

async def edit_message_with_retry(message, text):
    try:
        await message.edit_text(text)
    except FloodWait as e:
        await asyncio.sleep(e.value + 5)
        await message.edit_text(text)
    except Exception as e:
        print(f"Error editing message: {e}")

# --- Bot Handlers ---
print("Bot script loaded. Handlers are being registered...")

@bot.on_message(filters.command("start") & filters.private)
async def start_command(client, message: Message):
    await message.reply_text("Hello! Send me a file or a direct download URL to get a shareable link.")

async def handle_file_upload(message: Message, user_id: int):
    try:
        sent_message = await message.copy(chat_id=Config.STORAGE_CHANNEL)
        unique_id = secrets.token_urlsafe(8)
        
        # YAHAN BADLAV HAI: ID ko in-memory dictionary mein save karna
        link_db[unique_id] = sent_message.id
        
        show_link = f"{Config.BASE_URL}/show/{unique_id}"

        # Hum ab log channel use nahi karenge, isliye isse comment kar diya
        # log_text = (f"...")
        # await bot.send_message(Config.LOG_CHANNEL, log_text)

        await message.reply_text(f"Here is your shareable link:\n`{show_link}`", quote=True)

    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"!!! ERROR in handle_file_upload: {e}\n{error_trace}")
        await message.reply_text("Sorry, something went wrong.")


@bot.on_message(filters.private & (filters.document | filters.video | filters.audio))
async def file_handler(client, message: Message):
    await handle_file_upload(message, message.from_user.id)
    
# Baaki ka URL handler same rahega
# ... (rest of the file is the same)
@bot.on_message(filters.command("url") & filters.private)
async def url_upload_handler(client, message: Message):
    if len(message.command) < 2:
        await message.reply_text("Usage: `/url <direct_download_url>`"); return

    url = message.command[1]
    file_name = os.path.basename(urlparse(url).path) or f"file_{int(time.time())}"
    status_msg = await message.reply_text("Processing your link...")

    if not os.path.exists('downloads'): os.makedirs('downloads')
    file_path = os.path.join('downloads', file_name)
    last_edit_time = 0

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=None) as resp:
                if resp.status != 200:
                    await status_msg.edit_text(f"Download failed! Status: {resp.status}"); return
                total_size = int(resp.headers.get('content-length', 0))
                downloaded_size = 0
                async with aiofiles.open(file_path, 'wb') as f:
                    async for chunk in resp.content.iter_chunked(1024 * 1024):
                        await f.write(chunk)
                        downloaded_size += len(chunk)
                        current_time = time.time()
                        if current_time - last_edit_time > 2:
                            last_edit_time = current_time
                            await edit_message_with_retry(status_msg, f"**Downloading...**\n`{get_readable_file_size(downloaded_size)}` of `{get_readable_file_size(total_size)}`")
    except Exception as e:
        await status_msg.edit_text(f"Download Error: {e}")
        if os.path.exists(file_path): os.remove(file_path)
        return

    last_edit_time = 0
    async def progress(current, total):
        nonlocal last_edit_time
        current_time = time.time()
        if current_time - last_edit_time > 2:
            last_edit_time = current_time
            await edit_message_with_retry(status_msg, f"**Uploading...**\n`{get_readable_file_size(current)}` of `{get_readable_file_size(total)}`")

    try:
        sent_message = await client.send_document(chat_id=Config.STORAGE_CHANNEL, document=file_path, progress=progress)
    finally:
        if os.path.exists(file_path): os.remove(file_path)

    await handle_file_upload(sent_message, message.from_user.id)
    await status_msg.delete()
