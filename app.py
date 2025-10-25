import os
import asyncio
import secrets
import traceback
import uvicorn
from urllib.parse import urlparse

import aiohttp
import aiofiles
from pyrogram import Client, filters, idle
from pyrogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from pyrogram.errors import FloodWait
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from pyrogram.file_id import FileId
from pyrogram import raw
from pyrogram.session import Session, Auth
import math

# Imports from your other project files
from config import Config
from database import db

# --- Global Variables and Initialization ---

# FastAPI App
app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Pyrogram Bot Client
bot = Client(
    "SimpleStreamBot",
    api_id=Config.API_ID,
    api_hash=Config.API_HASH,
    bot_token=Config.BOT_TOKEN,
    in_memory=True  # Best for serverless environments like Render
)

# Dictionaries for multi-client streaming
multi_clients = {}
work_loads = {}
class_cache = {}

# --- Helper Functions ---

def get_readable_file_size(size_in_bytes):
    if not size_in_bytes: return '0B'
    power, n = 1024, 0
    power_labels = {0: '', 1: 'K', 2: 'M', 3: 'G'}
    while size_in_bytes >= power and n < len(power_labels):
        size_in_bytes /= power; n += 1
    return f"{size_in_bytes:.2f} {power_labels[n]}B"

def mask_filename(name: str):
    if not name: return "Protected File"
    resolutions = ["2160p", "1080p", "720p", "480p", "360p"]
    res_part = ""
    for res in resolutions:
        if res in name: res_part = f" {res}"; name = name.replace(res, ""); break
    base, ext = os.path.splitext(name)
    masked_base = ''.join(c if (i % 3 == 0 and c.isalnum()) else '*' for i, c in enumerate(base))
    return f"{masked_base}{res_part}{ext}"

# --- Pyrogram Bot Handlers ---

@bot.on_message(filters.command("start") & filters.private)
async def start_command(_, message: Message):
    user_name = message.from_user.first_name
    await message.reply_text(f"""
👋 **Hello, {user_name}!**
I generate direct download links for your files. Just send me any file or use /url to upload from a link.
""")

async def handle_file_upload(message: Message, user_id: int):
    try:
        sent_message = await message.copy(chat_id=Config.STORAGE_CHANNEL)
        unique_id = secrets.token_urlsafe(8)
        await db.save_link(unique_id, sent_message.id)
        final_link = f"{Config.BASE_URL}/show/{unique_id}"
        button = InlineKeyboardMarkup([[InlineKeyboardButton("Open Your Link 🔗", url=final_link)]])
        await message.reply_text("✅ Your shareable link has been generated!", reply_markup=button, quote=True)
    except Exception as e:
        print(f"!!! ERROR in handle_file_upload: {traceback.format_exc()}")
        await message.reply_text("Sorry, something went wrong. Check if the bot is an admin in the storage channel.")

@bot.on_message(filters.private & (filters.document | filters.video | filters.audio))
async def file_handler(_, message: Message):
    await handle_file_upload(message, message.from_user.id)

@bot.on_message(filters.command("url") & filters.private & filters.user(Config.OWNER_ID))
async def url_upload_handler(_, message: Message):
    if len(message.command) < 2:
        await message.reply_text("Usage: `/url <direct_download_link>`"); return
    url = message.command[1]
    file_name = os.path.basename(urlparse(url).path) or f"file_{int(time.time())}"
    status_msg = await message.reply_text("Processing your link...")
    if not os.path.exists('downloads'): os.makedirs('downloads')
    file_path = os.path.join('downloads', file_name)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=None) as resp:
                if resp.status != 200:
                    await status_msg.edit_text(f"Download failed! Status: {resp.status}"); return
                async with aiofiles.open(file_path, 'wb') as f:
                    async for chunk in resp.content.iter_chunked(1024 * 1024):
                        await f.write(chunk)
    except Exception as e:
        await status_msg.edit_text(f"Download Error: {e}");
        if os.path.exists(file_path): os.remove(file_path)
        return
    try:
        sent_message = await bot.send_document(chat_id=Config.STORAGE_CHANNEL, document=file_path)
        await handle_file_upload(sent_message, message.from_user.id)
        await status_msg.delete()
    finally:
        if os.path.exists(file_path): os.remove(file_path)

# --- FastAPI Web Server Routes ---

class ByteStreamer:
    def __init__(self, client: Client): self.client = client
    @staticmethod
    async def get_location(file_id: FileId): return raw.types.InputDocumentFileLocation(id=file_id.media_id, access_hash=file_id.access_hash, file_reference=file_id.file_reference, thumb_size=file_id.thumbnail_size)
    async def yield_file(self, file_id: FileId, index: int, offset: int, first_part_cut: int, last_part_cut: int, part_count: int, chunk_size: int):
        client = self.client; work_loads[index] += 1
        media_session = client.media_sessions.get(file_id.dc_id)
        if media_session is None:
            if file_id.dc_id != await client.storage.dc_id():
                auth_key = await Auth(client, file_id.dc_id, await client.storage.test_mode()).create(); media_session = Session(client, file_id.dc_id, auth_key, await client.storage.test_mode(), is_media=True); await media_session.start(); exported_auth = await client.invoke(raw.functions.auth.ExportAuthorization(dc_id=file_id.dc_id)); await media_session.invoke(raw.functions.auth.ImportAuthorization(id=exported_auth.id, bytes=exported_auth.bytes))
            else: media_session = client.session
            client.media_sessions[file_id.dc_id] = media_session
        location = await self.get_location(file_id); current_part = 1
        try:
            while current_part <= part_count:
                r = await media_session.invoke(raw.functions.upload.GetFile(location=location, offset=offset, limit=chunk_size), retries=0)
                if isinstance(r, raw.types.upload.File):
                    chunk = r.bytes
                    if not chunk: break
                    if part_count == 1: yield chunk[first_part_cut:last_part_cut]
                    elif current_part == 1: yield chunk[first_part_cut:]
                    elif current_part == part_count: yield chunk[:last_part_cut]
                    else: yield chunk
                    current_part += 1; offset += chunk_size
                else: break
        finally: work_loads[index] -= 1

@app.get("/show/{unique_id}", response_class=HTMLResponse)
async def show_file_page(request: Request, unique_id: str):
    storage_msg_id = await db.get_link(unique_id)
    if not storage_msg_id: raise HTTPException(status_code=404, detail="Link expired or invalid.")
    main_bot = multi_clients.get(0)
    if not main_bot: raise HTTPException(status_code=503, detail="Bot not ready.")
    file_msg = await main_bot.get_messages(Config.STORAGE_CHANNEL, storage_msg_id)
    media = file_msg.document or file_msg.video or file_msg.audio
    if not media: raise HTTPException(status_code=404, detail="File not found.")
    original_file_name = media.file_name or "file"; safe_file_name = "".join(c for c in original_file_name if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
    context = {"request": request, "file_name": mask_filename(original_file_name), "file_size": get_readable_file_size(media.file_size), "is_media": (media.mime_type or "").startswith(("video/", "audio/")), "direct_dl_link": f"{Config.BASE_URL}/dl/{storage_msg_id}/{safe_file_name}", "mx_player_link": f"intent:{Config.BASE_URL}/dl/{storage_msg_id}/{safe_file_name}#Intent;action=android.intent.action.VIEW;type={media.mime_type or 'video/*'};end", "vlc_player_link": f"vlc://{Config.BASE_URL}/dl/{storage_msg_id}/{safe_file_name}"}
    return templates.TemplateResponse("show.html", context)

@app.get("/dl/{msg_id}/{file_name}")
async def stream_handler(request: Request, msg_id: int, file_name: str):
    index = min(work_loads, key=work_loads.get, default=0); client = multi_clients.get(index)
    if not client: raise HTTPException(503, detail="No available clients.")
    tg_connect = class_cache.get(client) or ByteStreamer(client); class_cache[client] = tg_connect
    try:
        message = await client.get_messages(Config.STORAGE_CHANNEL, msg_id)
        media = message.document or message.video or message.audio
        if not media or message.empty: raise FileNotFoundError
        file_id = FileId.decode(media.file_id); file_size = media.file_size
        range_header = request.headers.get("Range", 0); from_bytes, until_bytes = 0, file_size - 1
        if range_header:
            from_bytes_str, until_bytes_str = range_header.replace("bytes=", "").split("-"); from_bytes = int(from_bytes_str)
            if until_bytes_str: until_bytes = int(until_bytes_str)
        if (until_bytes >= file_size) or (from_bytes < 0): raise HTTPException(416, detail="Range not satisfiable")
        req_length = until_bytes - from_bytes + 1; chunk_size = 1024 * 1024; offset = (from_bytes // chunk_size) * chunk_size
        first_part_cut = from_bytes - offset; last_part_cut = (until_bytes % chunk_size) + 1; part_count = math.ceil(req_length / chunk_size)
        body = tg_connect.yield_file(file_id, index, offset, first_part_cut, last_part_cut, part_count, chunk_size)
        status_code = 206 if range_header else 200
        headers = {"Content-Type": media.mime_type or "application/octet-stream", "Accept-Ranges": "bytes", "Content-Disposition": f'inline; filename="{media.file_name}"', "Content-Length": str(req_length)}
        if range_header: headers["Content-Range"] = f"bytes {from_bytes}-{until_bytes}/{file_size}"
        return StreamingResponse(content=body, status_code=status_code, headers=headers)
    except FileNotFoundError: raise HTTPException(404, detail="File not found.")
    except Exception: print(traceback.format_exc()); raise HTTPException(500, detail="Internal streaming error.")

# --- Main Execution Block ---

async def main():
    """Starts Bot and Web Server together."""
    print("--- Initializing Services ---")
    
    # Connect to DB
    await db.connect()
    
    # Start the bot, with FloodWait handling
    try:
        print("Starting main bot...")
        await bot.start()
    except FloodWait as e:
        print(f"!!! FloodWait of {e.value}s received. Sleeping, then Render will restart.")
        await asyncio.sleep(e.value)
        # The script will exit, Render's auto-restart will act as our retry mechanism.
        return

    print(f"Bot [@{bot.me.username}] started successfully.")
    
    # Verify channel access
    try:
        print(f"Verifying channel access for {Config.STORAGE_CHANNEL}...")
        # A simple, lightweight check
        await bot.get_chat(Config.STORAGE_CHANNEL)
        print("✅ Channel is accessible.")
    except Exception as e:
        print(f"\n❌❌❌ FATAL: Could not access STORAGE_CHANNEL. Error: {e}\n")
        print("This is a CONFIGURATION ERROR. Please check your STORAGE_CHANNEL ID and ensure the bot is an admin in that channel.")
        return # Exit if channel is not accessible

    # Setup multi-client dictionary
    multi_clients[0] = bot
    work_loads[0] = 0
    # Add logic for more clients if needed in the future

    # Configure and start Uvicorn server
    port = int(os.environ.get("PORT", 8000))
    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="info")
    server = uvicorn.Server(config)
    
    # Run bot and web server concurrently
    print(f"\nStarting web server on http://0.0.0.0:{port}")
    print("✅✅✅ All services are up and running! ✅✅✅\n")
    
    # Use the same loop and run both tasks
    loop = asyncio.get_event_loop()
    bot_task = loop.create_task(idle()) # Pyrogram's idle()
    web_server_task = loop.create_task(server.serve())
    
    await asyncio.gather(bot_task, web_server_task)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutdown signal received.")
    finally:
        print("--- Services are shutting down ---")
        if bot.is_running:
            asyncio.run(bot.stop())
        print("Shutdown complete.")
