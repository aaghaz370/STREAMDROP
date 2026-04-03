# app.py (THE REAL, FINAL, CLEAN, EASY-TO-READ FULL CODE)

import os
import asyncio
import threading

# --- FIX: EVENT LOOP FOR NEWER PYTHON VERSIONS ---
try:
    asyncio.get_event_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())
# ------------------------------------------------

import secrets
import traceback
import uvicorn
import re
import logging
from contextlib import asynccontextmanager

from pyrogram import Client, filters, enums
from pyrogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, ChatMemberUpdated
from pyrogram.errors import FloodWait, UserNotParticipant
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pyrogram.file_id import FileId
from pyrogram import raw
from pyrogram.session import Session, Auth
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import math

# Project ki dusri files se important cheezein import karo
from config import Config
from database import db
import logger as L  # Log channel integration

# =====================================================================================
# --- SETUP: BOT, WEB SERVER, AUR LOGGING ---
# =====================================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Yeh function bot ko web server ke saath start aur stop karta hai.
    """
    print("--- Lifespan: Server chalu ho raha hai... ---")
    
    await db.connect()
    
    # Restoring Session across Render OOM reboots
    await db.load_session_file("SimpleStreamBot", "SimpleStreamBot.session")
    
    try:
        print("Starting main Pyrogram bot...")
        await bot.start()
        
        me = await bot.get_me()
        Config.BOT_USERNAME = me.username
        print(f"✅ Main Bot [@{Config.BOT_USERNAME}] safaltapoorvak start ho gaya.")

        # --- SET BOT MENU COMMANDS ---
        try:
            from pyrogram.types import BotCommand
            await bot.set_bot_commands([
                BotCommand("start", "🏠 Start Bot"),
                BotCommand("help", "📝 Help & Guide"),
                BotCommand("showplan", "💎 Premium Plans"),
                BotCommand("mydata", "📊 My Data & Usage"),
                BotCommand("allcommands", "📜 All Commands List"),
                BotCommand("my_links", "🔗 My Files")
            ])
            print("✅ Bot Commands Menu Set.")
        except Exception as e:
            print(f"Warning: Could not set bot commands: {e}")

        if len(multi_clients) > 1:
            print(f"✅ Multi-Client Mode Enabled. Total Clients: {len(multi_clients)}")

        # Ensure we know about the channels
        # force_refresh_dialogs removed as it is not supported for bots

        print(f"Verifying storage channel ({Config.STORAGE_CHANNEL})...")
        try:
            await bot.get_chat(Config.STORAGE_CHANNEL)
            print("✅ Storage channel accessible hai.")
        except Exception as e:
            print(f"!!! ERROR: Could not access Storage Channel ({Config.STORAGE_CHANNEL}). Error: {e}")
            print("👉 ACTION REQUIRED: Please SEND A MESSAGE (e.g. '.') in the Storage Channel NOW so I can find it!")

        if Config.FORCE_SUB_CHANNEL:
            try:
                print(f"Verifying force sub channel ({Config.FORCE_SUB_CHANNEL})...")
                await bot.get_chat(Config.FORCE_SUB_CHANNEL)
                print("✅ Force Sub channel accessible hai.")
            except Exception as e:
                print(f"!!! WARNING: Bot cannot access Force Sub channel ({Config.FORCE_SUB_CHANNEL}). Bot, Force Sub channel mein admin nahi hai ya link galat hai. Error: {e}")
        
        try:
            await cleanup_channel(bot)
        except Exception as e:
            print(f"Warning: Channel cleanup fail ho gaya. Error: {e}")

        # --- STARTUP BROADCAST (BACKGROUND) ---
        # Send restart notification to all users (non-blocking)
        asyncio.create_task(send_startup_broadcast())

        await db.save_session_file("SimpleStreamBot", "SimpleStreamBot.session")

        # Fire log_bot_start after a short delay to ensure bot is fully ready
        async def _delayed_start_log():
            import asyncio
            await asyncio.sleep(3)
            await L.log_bot_start()
        asyncio.create_task(_delayed_start_log())

        print("--- Lifespan: Startup safaltapoorvak poora hua. ---")
    
    except Exception as e:
        print(f"!!! FATAL ERROR: Bot startup ke dauraan error aa gaya: {traceback.format_exc()}")
    
    yield
    
    print("--- Lifespan: Server band ho raha hai... ---")
    if bot.is_initialized:
        await bot.stop()
    print("--- Lifespan: Shutdown poora hua. ---")

app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="templates"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOG FILTER: YEH SIRF /dl/ WALE LOGS KO CHUPAYEGA ---
# class HideDLFilter(logging.Filter):
#     def filter(self, record: logging.LogRecord) -> bool:
#         # Agar log message mein "GET /dl/" hai, toh usse mat dikhao
#         return "GET /dl/" not in record.getMessage()

# Uvicorn ke 'access' logger par filter lagao
# logging.getLogger("uvicorn.access").addFilter(HideDLFilter())
# --- FIX KHATAM ---

bot = Client("SimpleStreamBot", api_id=Config.API_ID, api_hash=Config.API_HASH, bot_token=Config.BOT_TOKEN, in_memory=False)
multi_clients = {}; work_loads = {}; class_cache = {}

# Performance Cache (reduces DB queries for frequent operations)
user_status_cache = {}  # {user_id: (status_data, expiry_timestamp)}
CACHE_TTL = 60  # Cache for 60 seconds

# --- CHANNEL WARMUP HANDLER ---
@bot.on_message(filters.channel)
async def channel_warmup(client: Client, message: Message):
    # This handler helps the bot "see" the channel and cache its Access Hash
    # correcting the "Peer id invalid" error on fresh sessions.
    print(f"🔥 CHANNEL WARMUP: Detected message in {message.chat.title} ({message.chat.id}). Access Hash cached.")
    # Safe session backup
    await db.save_session_file("SimpleStreamBot", "SimpleStreamBot.session")

# --- CHECK ACCESS HELPER (ForceSub + Ban) ---
async def check_access(user_id: int):
    # 1. Check Ban
    if await db.is_banned(user_id):
        return False, "**🚫 You are BANNED from using this bot.**\n__Contact Admin for support.__"
    
    # 2. Check Force Sub (Only if configured)
    if Config.FORCE_SUB_CHANNEL:
        try:
            await bot.get_chat_member(Config.FORCE_SUB_CHANNEL, user_id)
        except UserNotParticipant:
            try:
                invite_link = (await bot.get_chat(Config.FORCE_SUB_CHANNEL)).invite_link
                if not invite_link:
                     invite_link = f"https://t.me/{str(Config.FORCE_SUB_CHANNEL).replace('@', '')}"
            except:
                invite_link = f"https://t.me/{str(Config.FORCE_SUB_CHANNEL).replace('@', '')}"
            
            # Special return for Force Sub to allow constructing Inline Keyboard
            # Log the block event (fire and forget)
            try:
                user_obj = await bot.get_users(user_id)
                asyncio.create_task(L.log_force_sub_fail(user_obj))
            except Exception:
                pass
            return False, ("FORCE_SUB", invite_link)
        except Exception:
            # If bot can't check (e.g. not admin), pass to avoid blocking user
            pass
            
    return True, None

# =====================================================================================
# --- MULTI-CLIENT LOGIC ---
# =====================================================================================

class TokenParser:
    """ Environment variables se MULTI_TOKENs ko parse karta hai. """
    @staticmethod
    def parse_from_env():
        return {
            c + 1: t
            for c, (_, t) in enumerate(
                filter(lambda n: n[0].startswith("MULTI_TOKEN"), sorted(os.environ.items()))
            )
        }

async def start_client(client_id, bot_token):
    """ Ek naye client bot ko start karta hai. """
    try:
        print(f"Attempting to start Client: {client_id}")
        client = await Client(
            name=str(client_id), 
            api_id=Config.API_ID, 
            api_hash=Config.API_HASH,
            bot_token=bot_token, 
            no_updates=True, 
            in_memory=True
        ).start()
        work_loads[client_id] = 0
        multi_clients[client_id] = client
        print(f"✅ Client {client_id} started successfully.")
    except Exception as e:
        print(f"!!! CRITICAL ERROR: Failed to start Client {client_id} - Error: {e}")

async def initialize_clients():
    """ Saare additional clients ko initialize karta hai. """
    all_tokens = TokenParser.parse_from_env()
    if not all_tokens:
        print("No additional clients found. Using default bot only.")
        return
    
    print(f"Found {len(all_tokens)} extra clients. Starting them...")
    tasks = [start_client(i, token) for i, token in all_tokens.items()]
    await asyncio.gather(*tasks)

    if len(multi_clients) > 1:
        print(f"✅ Multi-Client Mode Enabled. Total Clients: {len(multi_clients)}")

# =====================================================================================
# --- HELPER FUNCTIONS ---
# =====================================================================================

def get_readable_file_size(size_in_bytes):
    if not size_in_bytes:
        return '0B'
    power = 1024
    n = 0
    power_labels = {0: 'B', 1: 'KB', 2: 'MB', 3: 'GB'}
    while size_in_bytes >= power and n < len(power_labels) - 1:
        size_in_bytes /= power
        n += 1
    return f"{size_in_bytes:.2f} {power_labels[n]}"

def mask_filename(name: str):
    if not name:
        return "Protected File"
    base, ext = os.path.splitext(name)
    metadata_pattern = re.compile(
        r'((19|20)\d{2}|4k|2160p|1080p|720p|480p|360p|HEVC|x265|BluRay|WEB-DL|HDRip)',
        re.IGNORECASE
    )
    match = metadata_pattern.search(base)
    if match:
        title_part = base[:match.start()].strip(' .-_')
        metadata_part = base[match.start():]
    else:
        title_part = base
        metadata_part = ""
    masked_title = ''.join(c if (i % 3 == 0 and c.isalnum()) else ('*' if c.isalnum() else c) for i, c in enumerate(title_part))
    return f"{masked_title} {metadata_part}{ext}".strip()

# =====================================================================================
# --- PYROGRAM BOT HANDLERS ---
# =====================================================================================

@bot.on_message(filters.command("start") & filters.private)
async def start_command(client: Client, message: Message):
    user_id = message.from_user.id
    
    # --- CHECK ACCESS ---
    is_allowed, error_data = await check_access(user_id)
    if not is_allowed:
        if isinstance(error_data, tuple) and error_data[0] == "FORCE_SUB":
            # Show Force Sub UI
            invite_link = error_data[1]
            try:
                # If start command has arguments (verify_xyz), pass it to refresh
                start_arg = message.command[1] if len(message.command) > 1 else "True"
            except:
                start_arg = "True"
                
            join_btn = InlineKeyboardButton("📣 JOIN CHANNEL TO ACCESS", url=invite_link)
            retry_btn = InlineKeyboardButton("🔄 REFRESH / TRY AGAIN", url=f"https://t.me/{Config.BOT_USERNAME}?start={start_arg}")
            await message.reply_text(
                "**🔒 ACCESS LOCKED!**\n\n"
                "__You must join our official channel to use this bot.__\n"
                "__Join below and click Refresh.__",
                reply_markup=InlineKeyboardMarkup([[join_btn], [retry_btn]]),
                quote=True
            )
            return
        else:
            # Banned or other error
            await message.reply_text(error_data, quote=True)
            return

    # --- NORMAL START LOGIC ---
    if len(message.command) > 1 and message.command[1].startswith("verify_"):
        unique_id = message.command[1].split("_", 1)[1]
        final_link = f"{Config.BASE_URL}/show/{unique_id}"
        reply_text = f"**🎥 File is Ready!**\n\n**🔗 Link:** [Click Here to Stream]({final_link})\n\n__Univora StreamDrop__"
        
        # Localhost fix
        if "localhost" in Config.BASE_URL or "127.0.0.1" in Config.BASE_URL:
             await message.reply_text(reply_text, quote=True, disable_web_page_preview=False)
        else:
             button = InlineKeyboardMarkup([[InlineKeyboardButton("🎬 WATCH / DOWNLOAD NOW", url=final_link)]])
             await message.reply_text(reply_text, reply_markup=button, quote=True, disable_web_page_preview=False)

    else:
        # MAIN MENU START MESSAGE
        reply_text = f"""
⚡ **Univora StreamDrop** ⚡
__The Ultimate Telegram File Streaming Bot.__

**🚀 What Can I Do?**
• **Stream Videos** directly without downloading.
• **Convert Files** to direct download links.
• **Store Files** securely on our cloud.

**💎 Premium Features:**
• **Unlimited** Uploads.
• **Long-Term** Link Validity.
• **Ad-Free** Experience.

__👇 Click below to see Plans or get Help!__
"""
        buttons = InlineKeyboardMarkup([
            [InlineKeyboardButton("💎 Premium Plans", callback_data="plans"), InlineKeyboardButton("📢 Official Channel", url="https://t.me/Univora88")],
            [InlineKeyboardButton("🆘 Help & Guide", callback_data="help"), InlineKeyboardButton("📂 My Files", callback_data="my_links")]
        ])
        await message.reply_text(reply_text, reply_markup=buttons)

        # Log new user (check if truly new via db)
        try:
            user_data = await db.get_user_data(message.from_user.id)
            is_new = user_data.get("daily_count", 0) == 0 and not user_data.get("plan")
            asyncio.create_task(L.log_new_user(message.from_user, is_new=True))
        except Exception:
            pass

@bot.on_message(filters.command("help") & filters.private)
async def help_command(client: Client, message: Message):
    text = """
📚 **HOW TO USE STREAMDROP**

**Step 1: Upload a File**
Forward any Video, Audio, or Document (up to 4GB) to this bot.

**Step 2: Get Your Link**
I will instantly generate a **Stream Link** and a **Download Link**.

**Step 3: Watch or Download**
• Click **Stream Online** to watch videos directly in your browser.
• Click **Download** for high-speed direct downloads.

**Step 4: Manage Files**
Use `/my_links` to see your recent uploads.

──────────────────

**💎 SUBSCRIPTION RULES**

**1. Free Users:**
• Limit: **5 Files / Day**
• Link Expiry: **24 Hours**

**2. Premium Users:**
• Limit: **UNLIMITED**
• Link Expiry: **Up to 1 Year**

👉 Type `/showplan` to upgrade now!
    """
    await message.reply_text(text, quote=True, disable_web_page_preview=True)

@bot.on_message(filters.command("my_links") & filters.private)
async def my_links_command(client: Client, message: Message):
    user_id = message.from_user.id
    # Updated to fetch only Active links, limit 5 for chat
    links = await db.get_user_active_links(user_id, limit=5)
    
    if not links:
        await message.reply_text("**📂 No active files found.**\nStart uploading to see them here!", quote=True)
        return
        
    text = f"**📂 My Recent Files (Last 5)**\n\n"
    for link in links:
        file_name = link.get("file_name", "Unknown")
        unique_id = link.get("_id")
        url = f"{Config.BASE_URL}/show/{unique_id}"
        expiry = link.get("expiry_date")
        expiry_info = f"⏳ `Expires: {expiry.strftime('%d-%m-%Y')}`" if expiry else "⏳ `No Expiry`"
        text += f"📄 **{file_name}**\n🔗 `{url}`\n{expiry_info}\n\n"
    
    # Generate Secure Dashboard Link
    import hmac, hashlib
    # Secret key should be unique to bot. Using BOT_TOKEN as salt.
    secret = Config.BOT_TOKEN.encode()
    msg = str(user_id).encode()
    token = hmac.new(secret, msg, hashlib.sha256).hexdigest()
    
    dashboard_url = f"{Config.BASE_URL}/dashboard/{user_id}?token={token}"
    
    # Ensure URL has protocol (Telegram Requirement)
    if not dashboard_url.startswith(("http://", "https://")):
        dashboard_url = f"http://{dashboard_url}"
    
    print(f"DEBUG: Generated Dashboard URL: '{dashboard_url}'") # Debug Print
    
    buttons = InlineKeyboardMarkup([
         [InlineKeyboardButton("📂 OPEN WEB DASHBOARD", url=dashboard_url)]
    ])
        
    await message.reply_text(text, quote=True, disable_web_page_preview=True, reply_markup=buttons)

@bot.on_callback_query()
async def callback_handlers(client: Client, cb: "CallbackQuery"):
    if cb.data == "help":
        await help_command(client, cb.message)
    elif cb.data == "my_links":
        # Use cb.from_user.id — cb.message.from_user is the BOT itself
        cb.message.from_user = cb.from_user
        await my_links_command(client, cb.message)
    elif cb.data == "plans":
        await show_plans_command(client, cb.message)
        
    await cb.answer()

from subscription import get_plan_status, increment_user_usage, PLANS

# ... (Previous imports)

@bot.on_message(filters.command("showplan") & filters.private)
async def show_plans_command(client: Client, message: Message):
    user_id = message.from_user.id
    status = await get_plan_status(user_id)
    plan_name_str = status.get('plan_type', 'free')
    asyncio.create_task(L.log_showplan(message.from_user, plan_name_str))
    
    # helper to check active
    plan = plan_name_str
    def active_tag(p_name):
        return "✅ (CURRENT)" if plan == p_name else ""

    # User Status Box
    user_status_box = f"""
━━━━━━━━━━━━━━━━━━
👤 **YOUR CURRENT STATUS**
🏷 **Plan:** {status['name']}
⚡ **Daily Limit:** {status['daily_left']} left
⏳ **Plan Expiry:** {status.get('expiry_date') or 'Never'}
━━━━━━━━━━━━━━━━━━
"""

    text = f"""
💎 **PREMIUM SUBSCRIPTION PLANS** 💎

Unlock **Unlimited Uploads** & **Longer Link Expiry**!

**🚀 1 WEEK PLAN** {active_tag('weekly')}
├ 💸 **Price:** ₹70 / 7 Days
├ ⚡ **Uploads:** Unlimited
└ ⏳ **Link Expiry:** 6 Months

**🌟 1 MONTH PLAN** {active_tag('monthly')}
├ 💸 **Price:** ₹219 / 30 Days
├ ⚡ **Uploads:** Unlimited
└ ⏳ **Link Expiry:** 8 Months

**👑 2 MONTHS PLAN (BEST VALUE)** {active_tag('bimonthly')}
├ 💸 **Price:** ₹499 / 60 Days
├ ⚡ **Uploads:** Unlimited
└ ⏳ **Link Expiry:** 1 YEAR

{user_status_box}

💡 **How to Buy?**
Contact Admin to upgrade your plan instantly:
👤 **Admin:** @Univora88
"""
    await message.reply_text(text, quote=True)

@bot.on_message(filters.command("mydata") & filters.private)
async def mydata_command(client: Client, message: Message):
    user_id = message.from_user.id
    status = await get_plan_status(user_id)
    total_files = await db.get_user_total_links(user_id)
    
    # Format Expiry
    expiry = status.get("expiry_date")
    if expiry:
         expiry_str = expiry.strftime("%d %B %Y")
    else:
         expiry_str = "Never (Lifetime)" if status['plan_type'] != 'free' else "N/A"
         
    if status['plan_type'] == 'free':
        plan_display = "🆓 Free Account"
        upgrade_text = "\n💡 __Upgrade to Premium for Unlimited Uploads!__"
    else:
        plan_display = f"💎 {status['name'].upper()}"
        upgrade_text = ""

    text = f"""
📊 **MY USAGE & PLAN**

👤 **User ID:** `{user_id}`
🏷 **Current Plan:** `{plan_display}`
📅 **Plan Expiry:** `{expiry_str}`

📉 **Daily Usage:**
├ **Used:** `{status['current_count']}` files
└ **Limit:** `{status['daily_left']}` remaining

🗂 **Total Storage:**
└ **Total Files Uploaded:** `{total_files}`

{upgrade_text}
"""
    await message.reply_text(text, quote=True)

@bot.on_message(filters.command("allcommands") & filters.private)
async def all_commands_command(client: Client, message: Message):
    # --- PART 1: USER COMMANDS ---
    user_commands = """
📜 **COMMAND LIST**

🔰 **General Commands**
├ `/start` - Start the bot & check status
├ `/help` - Brief guide on how to use
├ `/showplan` - View Premium Plans & Pricing
├ `/mydata` - Check your Usage & Plan Expiry
└ `/my_links` - View your recently uploaded files

📤 **Usage**
Simply forward any file to me to get a Stream Link.
"""
    
    # --- PART 2: ADMIN COMMANDS (Hidden from normal users) ---
    if message.from_user.id == Config.OWNER_ID:
        admin_commands = """
━━━━━━━━━━━━━━━━━━
👑 **ADMIN COMMANDS (Owner Only)**

📊 **Statistics**
└ `/stats` - View Total Users & Links Count

🚫 **Moderation**
├ `/ban user_id` - Ban a user
└ `/unban user_id` - Unban a user

💎 **Subscription Management**
└ `/setplan user_id plan_name`
   ├ `free` (Reset to normal)
   ├ `weekly` (7 Days)
   ├ `monthly` (30 Days)
   └ `bimonthly` (2 Months)

⚡ **System**
└ `/broadcast message` - (Coming Soon)
━━━━━━━━━━━━━━━━━━
"""
        final_text = user_commands + admin_commands
    else:
        final_text = user_commands

    await message.reply_text(final_text, quote=True)

@bot.on_message(filters.command("setplan") & filters.private)
async def set_plan_command(client: Client, message: Message):
    if message.from_user.id != Config.OWNER_ID:
        return
    
    if len(message.command) < 3:
        await message.reply_text("Usage: `/setplan user_id plan_name`\n\nPlans: weekly, monthly, bimonthly, free")
        return
        
    try:
        target_id = int(message.command[1])
        plan_name = message.command[2].lower()
        
        if plan_name not in PLANS and plan_name != "free":
             await message.reply_text("Invalid Plan Name.")
             return

        # Calculate Expiry
        import datetime
        plans_duration = {
            "weekly": 7,
            "monthly": 30,
            "bimonthly": 60,
            "free": 0
        }
        
        duration = plans_duration.get(plan_name, 0)
        
        if duration > 0:
            plan_expiry = datetime.datetime.now() + datetime.timedelta(days=duration)
            msg_header = "🎉 **CONGRATULATIONS!**"
            msg_body = f"Your plan has been UPGRADED to **{plan_name.upper()}**."
            msg_footer = "⚡ Enjoy **Unlimited Uploads** & **Long Term Storage**!"
        else:
            plan_expiry = None
            msg_header = "⚠️ **PLAN CHANGED**"
            msg_body = f"Your plan has been reset to **FREE TIER**."
            msg_footer = "You can now upload **5 Files/Day**."
            
        await db.set_user_plan(target_id, plan_name, plan_expiry)
        
        await message.reply_text(f"✅ User `{target_id}` set to **{plan_name.upper()}**.")
        
        # Notify User with Premium UI
        try:
            await client.send_message(
                target_id, 
                f"{msg_header}\n\n{msg_body}\n\n{msg_footer}\n\n__Check your status with__ `/mydata`"
            )
        except:
            await message.reply_text(f"⚠️ User `{target_id}` could not be notified (Blocked Bot?).")
        asyncio.create_task(L.log_plan_set(message.from_user, target_id, plan_name, plan_expiry))
    except Exception as e:
        await message.reply_text(f"Error: {e}")

@bot.on_message(filters.command("broadcast") & filters.private)
async def broadcast_command(client: Client, message: Message):
    if message.from_user.id != Config.OWNER_ID:
        return

    if not message.reply_to_message:
        await message.reply_text("❌ **Usage:** Reply to a message with `/broadcast` to send it to all users.")
        return

    users = await db.get_all_users()
    total_users = len(users)
    
    status_msg = await message.reply_text(f"🚀 **Starting Broadcast...**\nTarget: `{total_users}` Users")
    
    success = 0
    blocked = 0
    deleted = 0
    failed = 0
    
    import asyncio
    
    for i, user in enumerate(users):
        try:
            user_id = user["_id"]
            await message.reply_to_message.copy(chat_id=user_id)
            success += 1
        except Exception as e:
            err_str = str(e)
            if "blocked" in err_str.lower():
                blocked += 1
            elif "user is deactivated" in err_str.lower():
                deleted += 1
            else:
                failed += 1
        
        # Update Status every 20 users
        if i % 20 == 0:
            await status_msg.edit_text(
                f"🚀 **Broadcasting...**\n\n"
                f"✅ Sent: `{success}`\n"
                f"🚫 Blocked: `{blocked}`\n"
                f"🗑 Deleted: `{deleted}`\n"
                f"⚠️ Errors: `{failed}`\n\n"
                f"⏳ Progress: `{i}/{total_users}`"
            )
        
        await asyncio.sleep(0.05) # Prevent FloodWait

    await status_msg.edit_text(
        f"✅ **BROADCAST COMPLETED**\n\n"
        f"👥 Total Users: `{total_users}`\n"
        f"✅ Success: `{success}`\n"
        f"🚫 Blocked: `{blocked}`\n"
        f"🗑 Deleted: `{deleted}`\n"
        f"⚠️ Failed: `{failed}`"
    )
    asyncio.create_task(L.log_broadcast(message.from_user, total_users, success, blocked, deleted, failed))


async def handle_file_upload(message: Message, user_id: int):
    # Check Access
    is_allowed, error_data = await check_access(user_id)
    if not is_allowed:
        if isinstance(error_data, tuple) and error_data[0] == "FORCE_SUB":
            invite = error_data[1]
            await message.reply_text(f"**🔒 Unlock Uploads!**\\nJoin [Our Channel]({invite}) to upload files.", quote=True)
            return
        else:
            return

    # --- SUBSCRIPTION CHECK ---
    status = await get_plan_status(user_id)
    if not status["can_upload"]:
        await message.reply_text(
            f"**🛑 DAILY LIMIT REACHED!**\n\n"
            f"You have used your **{status['current_count']} / 5** free daily uploads.\n"
            f"Upgrade to **Premium** for UNLIMITED uploads!\n\n"
            f"👉 Use `/showplan` to see prices.",
            quote=True
        )
        # Log limit hit
        asyncio.create_task(L.log_limit_hit(message.from_user, status['current_count'], 5))
        return

    try:
        sent_message = await message.copy(chat_id=Config.STORAGE_CHANNEL)
        unique_id = secrets.token_urlsafe(8)
        
        # Metadata Extraction
        media = message.document or message.video or message.audio or message.photo
        if message.photo:
             # Photo handling (highest quality)
             media = message.photo
             file_name = f"Photo_{unique_id}.jpg"
             file_size_bytes = media.file_size
             mime_type = "image/jpeg"
        else:
             file_name = getattr(media, "file_name", "Unknown_File")
             file_size_bytes = getattr(media, "file_size", 0)
             mime_type = getattr(media, "mime_type", "application/octet-stream") or "application/octet-stream"

        file_size = get_readable_file_size(file_size_bytes)
        
        # Save to DB with Expiry
        await db.save_link(
            unique_id, 
            sent_message.id, 
            {}, 
            file_name, 
            file_size, 
            user_id,
            expiry_date=status["expiry_date"]
        )
        
        # Increment Usage
        await increment_user_usage(user_id)
        
        # Generate Links with Proper URL Encoding
        from urllib.parse import quote
        
        # Validate BASE_URL
        base_url = Config.BASE_URL.strip()
        if not base_url:
            raise ValueError("BASE_URL is not configured. Please set it in environment variables.")
        
        # Ensure BASE_URL starts with http:// or https://
        if not base_url.startswith(('http://', 'https://')):
            base_url = f"https://{base_url}"
            
        # Force HTTPS for production domains to prevent Mixed Content errors in iframes
        if base_url.startswith("http://") and "localhost" not in base_url and "127.0.0.1" not in base_url:
            base_url = base_url.replace("http://", "https://", 1)
        
        # Remove trailing slash
        base_url = base_url.rstrip('/')
        
        # URL-encode the filename to handle special characters
        encoded_file_name = quote(file_name, safe='')
        
        embed_link_text = ""
        admin_query = ""
        if user_id == Config.OWNER_ID:
            admin_query = "?admin=true"
            embed_link = f"{base_url}/embed/{unique_id}"
            embed_link_text = f"⚙️ **Embed Code (Admin):**\n`<iframe src=\"{embed_link}\" width=\"100%\" height=\"100%\" frameborder=\"0\" allowfullscreen></iframe>`\n\n"
        
        page_link = f"{base_url}/show/{unique_id}{admin_query}"
        dl_link = f"{base_url}/dl/{unique_id}/{encoded_file_name}"
        
        # Detect Type & Build UI
        buttons = []
        status_text = ""
        
        if mime_type.startswith("video"):
            action_verb = "Stream"
            emoji = "▶️"
            status_text = f"🎞 **Stream Link:**\n`{page_link}`\n\n⬇️ **Download Link:**\n`{dl_link}`"
            buttons.append([InlineKeyboardButton(f"{emoji} {action_verb} Online", url=page_link), InlineKeyboardButton("📥 Download", url=dl_link)])
            
        elif mime_type.startswith("audio"):
            action_verb = "Listen"
            emoji = "🎵"
            status_text = f"🎵 **Listen Link:**\n`{page_link}`\n\n⬇️ **Download Link:**\n`{dl_link}`"
            buttons.append([InlineKeyboardButton(f"{emoji} {action_verb} Online", url=page_link), InlineKeyboardButton("📥 Download", url=dl_link)])
            
        elif mime_type == "application/pdf":
            action_verb = "Read"
            emoji = "📖"
            status_text = f"📖 **Read Link:**\n`{dl_link}`\n\n⬇️ **Download Link:**\n`{dl_link}`"
            buttons.append([InlineKeyboardButton(f"{emoji} {action_verb} PDF", url=dl_link), InlineKeyboardButton("📥 Download", url=dl_link)])
            
        elif mime_type.startswith("image"):
            action_verb = "View"
            emoji = "🖼"
            status_text = f"🖼 **View Link:**\n`{dl_link}`\n\n⬇️ **Download Link:**\n`{dl_link}`"
            buttons.append([InlineKeyboardButton(f"{emoji} {action_verb} Image", url=dl_link), InlineKeyboardButton("📥 Download", url=dl_link)])
            
        else:
            action_verb = "Download"
            status_text = f"⬇️ **Download Link:**\n`{dl_link}`"
            buttons.append([InlineKeyboardButton("📥 Fast Download", url=dl_link)])

        # Always add Univora Site
        buttons.append([InlineKeyboardButton("🌐 UNIVORA SITE", url="https://univora.site")])
        
        # Expire Notice
        expire_note = "\n⏳ **Link Expires:** `24 Hours`" if status['plan_type'] == 'free' else "\n⏳ **Link Expires:** `Premium`"
        if user_id == Config.OWNER_ID: expire_note = "\n⏳ **Link Expires:** `Never (Admin)`"

        # Final Reply with Buttons (Production Ready)
        await message.reply_text(
            f"**✅ File Safely Stored on Univora Cloud!**\n\n"
            f"**📂 Name:** `{file_name}`\n"
            f"**💾 Size:** `{file_size}`\n"
            f"{expire_note}\n\n"
            f"{status_text}\n\n"
            f"{embed_link_text}"
            f"__Tap the button below for {action_verb.lower()}.__\n"
            f"__Powered by Univora | Dev: Rolex Sir__",
            reply_markup=InlineKeyboardMarkup(buttons),
            quote=True
        )

        # Log file upload to log channel
        asyncio.create_task(L.log_file_upload(
            user=message.from_user,
            file_name=file_name,
            file_size=file_size,
            mime_type=mime_type,
            page_link=page_link,
            dl_link=dl_link,
            unique_id=unique_id,
            storage_msg_id=sent_message.id,
            plan_type=status['plan_type'],
            expiry_date=status.get('expiry_date')
        ))
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"!!! FILE UPLOAD ERROR !!!")
        print(f"User ID: {user_id}")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print(f"Full Traceback:\n{error_details}")
        await message.reply_text(
            f"**⚠️ Upload Failed**\n\n"
            f"Error: `{type(e).__name__}`\n"
            f"Details: `{str(e)[:100]}`\n\n"
            f"Please contact @RolexSir for support.",
            quote=True
        )

@bot.on_message(filters.private & (filters.document | filters.video | filters.audio | filters.photo))
async def file_handler(_, message: Message):
    await handle_file_upload(message, message.from_user.id)

@bot.on_message(filters.command("stats") & filters.private)
async def stats_command(client: Client, message: Message):
    if message.from_user.id != Config.OWNER_ID:
        return
        
    total_links = await db.count_links()
    total_users = await db.total_users()
    
    await message.reply_text(
        f"**📊 SYSTEM STATISTICS**\n\n"
        f"🔗 **Total Links:** `{total_links}`\n"
        f"👥 **Total Users:** `{total_users}`\n"
        f"💿 **Database:** MongoDB Atlas"
    )

@bot.on_message(filters.command("ban") & filters.private)
async def ban_command(client: Client, message: Message):
    if message.from_user.id != Config.OWNER_ID:
        return
        
    if len(message.command) < 2:
        await message.reply_text("Usage: `/ban user_id`")
        return
        
    try:
        user_id = int(message.command[1])
        await db.ban_user(user_id)
        await message.reply_text(f"🚫 User `{user_id}` has been BANNED.")
        asyncio.create_task(L.log_ban_action(message.from_user, user_id, "ban"))
    except Exception as e:
        await message.reply_text(f"Error: {e}")

@bot.on_message(filters.command("unban") & filters.private)
async def unban_command(client: Client, message: Message):
    if message.from_user.id != Config.OWNER_ID:
        return
        
    if len(message.command) < 2:
        await message.reply_text("Usage: `/unban user_id`")
        return
        
    try:
        user_id = int(message.command[1])
        await db.unban_user(user_id)
        await message.reply_text(f"✅ User `{user_id}` has been UNBANNED.")
        asyncio.create_task(L.log_ban_action(message.from_user, user_id, "unban"))
    except Exception as e:
        await message.reply_text(f"Error: {e}")

@bot.on_chat_member_updated(filters.chat(Config.STORAGE_CHANNEL))
async def simple_gatekeeper(c: Client, m_update: ChatMemberUpdated):
    try:
        if(m_update.new_chat_member and m_update.new_chat_member.status==enums.ChatMemberStatus.MEMBER):
            u=m_update.new_chat_member.user
            if u.id==Config.OWNER_ID or u.is_self: return
            print(f"Gatekeeper: Kicking {u.id}"); await c.ban_chat_member(Config.STORAGE_CHANNEL,u.id); await c.unban_chat_member(Config.STORAGE_CHANNEL,u.id)
    except Exception as e: print(f"Gatekeeper Error: {e}")

async def cleanup_channel(c: Client):
    print("Gatekeeper: Running cleanup..."); allowed={Config.OWNER_ID,c.me.id}
    try:
        async for m in c.get_chat_members(Config.STORAGE_CHANNEL):
            if m.user.id in allowed: continue
            if m.status in [enums.ChatMemberStatus.ADMINISTRATOR,enums.ChatMemberStatus.OWNER]: continue
            try: print(f"Cleanup: Kicking {m.user.id}"); await c.ban_chat_member(Config.STORAGE_CHANNEL,m.user.id); await asyncio.sleep(1)
            except FloodWait as e: await asyncio.sleep(e.value)
            except Exception as e: print(f"Cleanup Error: {e}")
    except Exception as e: print(f"Cleanup Error: {e}")

async def send_startup_broadcast():
    """
    Sends a restart notification to all users when bot starts.
    Runs in background, doesn't block startup.
    """
    try:
        # Wait 5 seconds for bot to fully initialize
        await asyncio.sleep(5)
        
        print("🔔 Starting Startup Broadcast...")
        
        # Get all users from database
        users = await db.get_all_users()
        total_users = len(users)
        
        if total_users == 0:
            print("ℹ️ No users to broadcast to.")
            return
        
        # Beautiful restart message
        restart_message = """
🔄 **STREAMDROP BOT RESTARTED** 🔄

✅ **Bot is now LIVE and fully operational!**

🚀 **What's New:**
• Faster file processing
• Improved streaming performance
• Enhanced stability

💡 **All your files are safe** and ready to stream!

Need help? Contact: @Univora88

__Powered by Univora | Dev: @rolexsir_8__
"""
        
        success = 0
        blocked = 0
        failed = 0
        
        # Send to all users
        for user in users:
            try:
                user_id = user["_id"]
                await bot.send_message(user_id, restart_message)
                success += 1
                await asyncio.sleep(0.05)  # Prevent FloodWait (20 msgs/second)
                
            except FloodWait as e:
                print(f"⏳ FloodWait: Sleeping {e.value}s...")
                await asyncio.sleep(e.value)
                # Retry after wait
                try:
                    await bot.send_message(user_id, restart_message)
                    success += 1
                except:
                    failed += 1
                    
            except Exception as e:
                error_str = str(e).lower()
                if "blocked" in error_str or "user is deactivated" in error_str:
                    blocked += 1
                else:
                    failed += 1
        
        # Final report
        print(f"✅ Startup Broadcast Complete!")
        print(f"   └─ Total Users: {total_users}")
        print(f"   └─ Success: {success}")
        print(f"   └─ Blocked/Deleted: {blocked}")
        print(f"   └─ Failed: {failed}")
        
    except Exception as e:
        print(f"⚠️ Startup Broadcast Error: {e}")
        # Don't crash bot, just log error

# =====================================================================================
# --- FASTAPI WEB SERVER ---
# =====================================================================================
 
@app.get("/")
async def health_check():
    """
    This route provides a 200 OK response for uptime monitors.
    """
    return {"status": "ok", "message": "Server is healthy and running!"}

@app.get("/show/{unique_id}", response_class=HTMLResponse)
async def show_page(request: Request, unique_id: str):
    return templates.TemplateResponse(
        "show.html",
        {"request": request}
    )

@app.get("/embed/{unique_id}", response_class=HTMLResponse)
async def embed_page(request: Request, unique_id: str):
    return templates.TemplateResponse(
        "embed.html",
        {"request": request}
    )

@app.get("/dashboard/{user_id}", response_class=HTMLResponse)
async def dashboard_page(request: Request, user_id: int, token: str):
    # 1. Validate Token (HMAC)
    try:
        import hmac, hashlib
        secret = Config.BOT_TOKEN.encode()
        msg = str(user_id).encode()
        expected_token = hmac.new(secret, msg, hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(token, expected_token):
             raise HTTPException(status_code=403, detail="Invalid Token. Please use the link from the bot.")
             
        # 2. Fetch ALL User Links (active + expired)
        links = await db.get_all_user_links_with_status(user_id)
        
        # 3. Format Data for Template
        formatted_links = []
        for link in links:
             f_name = link.get("file_name", "Unknown")
             f_size = link.get("file_size", "Unknown")
             u_id = link.get("_id")
             ts = link.get("timestamp", 0)
             expiry = link.get("expiry_date")
             is_expired = link.get("is_expired", False)
             dl_link = f"{Config.BASE_URL}/dl/{u_id}/{f_name}"
             stream_link = f"{Config.BASE_URL}/show/{u_id}"
             date_str = link.get("date_str", "Unknown")
             
             formatted_links.append({
                 "name": f_name,
                 "size": f_size,
                 "date": date_str,
                 "dl_link": dl_link,
                 "stream_link": stream_link,
                 "timestamp": ts,
                 "expiry": expiry.strftime('%Y-%m-%d') if expiry else "Never",
                 "is_expired": is_expired
             })
             
        import json
        app_data = {"links": formatted_links, "total": len(formatted_links)}
        return templates.TemplateResponse(
            "dashboard.html",
            {
                "request": request,
                "user_id": user_id,
                "links": formatted_links,
                "app_data_json": json.dumps(app_data, default=str),
                "total_count": len(formatted_links)
            }
        )
             
    except Exception as e:
         print(f"Dashboard Error: {e}")
         raise HTTPException(status_code=403, detail="Access Denied")
@app.get("/api/file/{unique_id}", response_class=JSONResponse)
async def get_file_details_api(request: Request, unique_id: str):
    # db.get_link_full directly returns data without Telegram API, preventing "Access Denied" on refresh due to FloodWaits
    link_data = await db.get_link_full(unique_id)
    
    if not link_data:
        raise HTTPException(status_code=404, detail="Link not found.")

    # Expired link: return 410 with a proper message instead of generic 404
    if link_data.get("is_expired"):
        raise HTTPException(status_code=410, detail="This link has expired. Please share the file again in the bot to get a new link.")
    file_name = link_data.get("file_name")
    if not file_name:
        file_name = "file"
        
    file_size = link_data.get("file_size")
    if not file_size:
        file_size = "Unknown Size"
    
    import mimetypes
    mime_type, _ = mimetypes.guess_type(file_name)
    mime_type = mime_type or "application/octet-stream"
    
    safe_file_name = "".join(c for c in file_name if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
    if not safe_file_name:
        safe_file_name = "file"
    
    # URL Encoding for streaming links
    from urllib.parse import quote
    encoded_file_name = quote(file_name, safe='')
    
    base_url = Config.BASE_URL.strip()
    if not base_url.startswith(('http://', 'https://')):
        base_url = f"https://{base_url}"
    if base_url.startswith("http://") and "localhost" not in base_url and "127.0.0.1" not in base_url:
        base_url = base_url.replace("http://", "https://", 1)
    base_url = base_url.rstrip('/')
        
    direct_dl_link = f"{base_url}/dl/{unique_id}/{encoded_file_name}"
    
    # Format intents correctly
    # VLC mobile needs specific action and scheme
    try:
        scheme, path = direct_dl_link.split("://", 1)
    except ValueError:
        scheme, path = "http", direct_dl_link
        
    vlc_mobile = f"intent://{path}#Intent;scheme={scheme};action=android.intent.action.VIEW;package=org.videolan.vlc;type=video/*;end;"
    mx_mobile = f"intent://{path}#Intent;scheme={scheme};action=android.intent.action.VIEW;package=com.mxtech.videoplayer.ad;type=video/*;end;"
    
    response_data = {
        "file_name": file_name,
        "file_size": file_size,
        "is_media": mime_type.startswith(("video", "audio")),
        "direct_dl_link": direct_dl_link,
        "embed_link": f"{base_url}/embed/{unique_id}",
        "mx_player_link": mx_mobile,
        "vlc_player_link_mobile": vlc_mobile,
        "vlc_player_link_pc": f"vlc://{direct_dl_link}",
        "playit_link": f"playit://playerv2/video?url={direct_dl_link}",
        "dashboard_link": None  # will be set below if admin
    }
    
    # Inject admin dashboard link using HMAC token
    user_id_from_db = link_data.get("user_id", 0)
    if user_id_from_db == Config.OWNER_ID:
        import hmac, hashlib
        secret = Config.BOT_TOKEN.encode()
        tok = hmac.new(secret, str(Config.OWNER_ID).encode(), hashlib.sha256).hexdigest()
        response_data["dashboard_link"] = f"{base_url}/dashboard/{Config.OWNER_ID}?token={tok}"
    
    # Fetch other active links from this user to build a Next/Queue UI in show.html
    user_files = []
    if user_id_from_db:
        # Get up to 30 other active links for the playlist sidebar
        others = await db.get_user_active_links(user_id_from_db, limit=30)
        for doc in others:
            if str(doc["_id"]) == str(unique_id):
                continue
            fname = doc.get("file_name", "Unknown")
            mt, _ = mimetypes.guess_type(fname)
            user_files.append({
                "id": str(doc["_id"]),
                "name": fname,
                "size": doc.get("file_size", ""),
                "stream_link": f"{base_url}/show/{doc['_id']}?admin=true" if user_id_from_db == Config.OWNER_ID else f"{base_url}/show/{doc['_id']}",
                "type": ("audio" if mt and mt.startswith("audio") else ("video" if mt and mt.startswith("video") else "file"))
            })
    
    response_data["user_files"] = user_files

    return response_data

class ByteStreamer:
    def __init__(self, c: Client):
        self.client = c

    @staticmethod
    async def get_location(f: FileId):
        from pyrogram.file_id import FileType
        if f.file_type == FileType.PHOTO:
            return raw.types.InputPhotoFileLocation(
                id=f.media_id,
                access_hash=f.access_hash,
                file_reference=f.file_reference,
                thumb_size=f.thumbnail_size or "y"
            )
        return raw.types.InputDocumentFileLocation(
            id=f.media_id,
            access_hash=f.access_hash,
            file_reference=f.file_reference,
            thumb_size=f.thumbnail_size
        )

    async def fetch_chunk(self, ms, loc, offset, limit):
        for attempt in range(5):
            try:
                r = await ms.invoke(
                    raw.functions.upload.GetFile(location=loc, offset=offset, limit=limit),
                    retries=1
                )
                if isinstance(r, raw.types.upload.File):
                    return r.bytes
                elif isinstance(r, raw.types.upload.FileCdnRedirect):
                    print("DEBUG: CDN Redirect")
                    break
            except (FloodWait) as e:
                await asyncio.sleep(e.value + 1)
            except Exception as e:
                await asyncio.sleep(0.5)
        return None

    async def yield_file(self, f: FileId, i: int, start_byte: int, end_byte: int, chunk_size: int):
        c = self.client
        work_loads[i] += 1
        
        # Session Setup
        ms = None
        for _ in range(3):
            try:
                ms = c.media_sessions.get(f.dc_id)
                if ms is None:
                    if f.dc_id != await c.storage.dc_id():
                        ak = await Auth(c, f.dc_id, await c.storage.test_mode()).create()
                        ms = Session(c, f.dc_id, ak, await c.storage.test_mode(), is_media=True)
                        await ms.start()
                        ea = await c.invoke(raw.functions.auth.ExportAuthorization(dc_id=f.dc_id))
                        await ms.invoke(raw.functions.auth.ImportAuthorization(id=ea.id, bytes=ea.bytes))
                    else:
                        ms = c.session
                    c.media_sessions[f.dc_id] = ms
                break
            except Exception as e:
                await asyncio.sleep(0.5)
        
        if not ms:
            work_loads[i] -= 1
            return 

        loc = await self.get_location(f)
        
        try:
            current_pos = start_byte
            bytes_remaining = end_byte - start_byte + 1
            
            while bytes_remaining > 0:
                chunk_index = current_pos // chunk_size
                req_offset = chunk_index * chunk_size
                
                chunk_data = await self.fetch_chunk(ms, loc, req_offset, chunk_size)
                
                if chunk_data is None:
                    print(f"CRITICAL: Failed to fetch chunk at {req_offset}")
                    break
                
                offset_in_chunk = current_pos % chunk_size
                
                if offset_in_chunk >= len(chunk_data):
                     break

                # Slice what we need
                available = len(chunk_data) - offset_in_chunk
                to_take = min(available, bytes_remaining)
                
                payload = chunk_data[offset_in_chunk : offset_in_chunk + to_take]
                
                yield payload
                
                sent_len = len(payload)
                current_pos += sent_len
                bytes_remaining -= sent_len
                
                if sent_len == 0:
                    break

        except Exception as e:
            print(f"Stream Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            work_loads[i] -= 1

@app.get("/dl/{unique_id}/{fname}")
async def stream_media(r:Request, unique_id: str, fname: str):
    # Retrieve Message ID from DB
    message_id, backups = await db.get_link(unique_id)
    if not message_id:
        raise HTTPException(status_code=404, detail="Link expired or invalid.")
    mid = message_id

    # Fallback logic for client selection
    c = None
    client_id = 0
    
    if work_loads and multi_clients:
        client_id = min(work_loads, key=work_loads.get)
        c = multi_clients.get(client_id)
    
    if not c:
        if bot:
            print("DEBUG: Using global 'bot' fallback for streaming.")
            c = bot
            client_id = 0
            if 0 not in work_loads: work_loads[0] = 0
        else:
            print("DEBUG: Critical - Both multi_clients and global bot missing.")
            raise HTTPException(503, detail="Bot not initialized")
    
    tc=class_cache.get(c) or ByteStreamer(c);class_cache[c]=tc
    try:
        msg=await c.get_messages(Config.STORAGE_CHANNEL,mid);m=msg.document or msg.video or msg.audio or msg.photo
        if not m or msg.empty:raise FileNotFoundError
        # Photos may not have .file_size directly; use getattr with fallback
        fid=FileId.decode(m.file_id)
        fsize=getattr(m,'file_size',None)
        if fsize is None:
            # Try largest PhotoSize
            sizes=getattr(m,'sizes',None)
            if sizes: fsize=getattr(sizes[-1],'file_size',None)
        if not fsize: fsize=0
        rh=r.headers.get("Range","");fb,ub=0,max(fsize-1,0)
        if rh:
            rps=rh.replace("bytes=","").split("-");fb=int(rps[0])
            if len(rps)>1 and rps[1]:ub=int(rps[1])
        if(ub>=fsize)or(fb<0):raise HTTPException(416)
        rl=ub-fb+1;cs=1024*1024
        
        # New Call Signature: pass start byte (fb) and end byte (ub) directly
        body=tc.yield_file(fid,client_id,fb,ub,cs)
        
        sc=206 if rh else 200
        # Photos don't have .mime_type or .file_name — derive safely
        import mimetypes as _mt
        _mime=getattr(m,'mime_type',None) or _mt.guess_type(fname)[0] or 'application/octet-stream'
        _fname=getattr(m,'file_name',None) or fname
        hdrs={"Content-Type":_mime,"Accept-Ranges":"bytes","Content-Disposition":f'inline; filename="{_fname}"',"Content-Length":str(rl)}
        if rh:hdrs["Content-Range"]=f"bytes {fb}-{ub}/{fsize}"
        return StreamingResponse(body,status_code=sc,headers=hdrs)
    except FileNotFoundError:raise HTTPException(404)
    except Exception:print(traceback.format_exc());raise HTTPException(500)



# =====================================================================================
# --- MAIN EXECUTION BLOCK ---
# =====================================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    
    # Performance Optimizations
    workers = int(os.environ.get("WEB_CONCURRENCY", 1))  # Render sets this automatically
    
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=port, 
        log_level="info",
        access_log=False,  # Disable detailed access logs for performance
        timeout_keep_alive=300,  # Keep connections alive for large file streams
        limit_concurrency=1000,  # Max concurrent connections
        backlog=2048  # Connection queue size
    )
