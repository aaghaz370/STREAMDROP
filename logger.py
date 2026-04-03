# logger.py — Advanced Log Channel System for StreamDrop Bot

import datetime
import traceback
from pyrogram.types import Message

# Lazy import to avoid circular imports
def _bot():
    from app import bot
    return bot

def _config():
    from config import Config
    return Config

# ─── Dividers & Emojis ──────────────────────────────────────
SEP  = "─" * 30
DSEP = "═" * 30

def _now() -> str:
    return datetime.datetime.now().strftime("%d %b %Y • %I:%M:%S %p")

def _user_line(user) -> str:
    """Build a clean user info block from a Pyrogram User object."""
    if not user:
        return "Unknown User"
    name  = f"{user.first_name or ''} {user.last_name or ''}".strip() or "No Name"
    uname = f"@{user.username}" if user.username else "No Username"
    uid   = user.id
    premium = "💎 Premium Telegram" if getattr(user, "is_premium", False) else "Free Telegram"
    return (
        f"👤 **Name:** {name}\n"
        f"🆔 **User ID:** `{uid}`\n"
        f"🔗 **Username:** {uname}\n"
        f"✨ **Account:** {premium}"
    )


# ═══════════════════════════════════════════════════════════
# LOG: NEW USER (first /start)
# ═══════════════════════════════════════════════════════════
async def log_new_user(user, is_new: bool = True):
    """Called when a user starts the bot for the very first time."""
    try:
        Config = _config()
        bot    = _bot()
        label  = "🆕 NEW USER REGISTERED" if is_new else "👋 USER RETURNED"
        text = (
            f"╔{DSEP}╗\n"
            f"  {label}\n"
            f"╚{DSEP}╝\n\n"
            f"{_user_line(user)}\n\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _StreamDrop Activity Log_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_new_user:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: NEW FILE UPLOAD / LINK CREATED
# ═══════════════════════════════════════════════════════════
async def log_file_upload(
    user,
    file_name: str,
    file_size: str,
    mime_type: str,
    page_link: str,
    dl_link: str,
    unique_id: str,
    storage_msg_id: int,
    plan_type: str,
    expiry_date=None
):
    """Called every time a user uploads a file and a stream link is created."""
    try:
        Config = _config()
        bot    = _bot()

        # File type icon
        if mime_type.startswith("video"):
            ficon = "🎬 Video"
        elif mime_type.startswith("audio"):
            ficon = "🎵 Audio"
        elif mime_type == "application/pdf":
            ficon = "📄 PDF"
        elif mime_type.startswith("image"):
            ficon = "🖼 Image"
        else:
            ficon = "📦 File"

        expiry_str = expiry_date.strftime("%d %b %Y") if expiry_date else "Never"
        plan_label = "💎 Premium" if plan_type != "free" else "🆓 Free"

        text = (
            f"╔{DSEP}╗\n"
            f"  📤 NEW LINK CREATED\n"
            f"╚{DSEP}╝\n\n"
            f"{_user_line(user)}\n"
            f"📊 **Plan:** {plan_label}\n\n"
            f"{SEP}\n"
            f"📁 **File:** `{file_name}`\n"
            f"💾 **Size:** `{file_size}`\n"
            f"🗂 **Type:** `{ficon}`\n"
            f"🔑 **Unique ID:** `{unique_id}`\n"
            f"⏳ **Expires:** `{expiry_str}`\n\n"
            f"🌐 **Stream Link:**\n`{page_link}`\n\n"
            f"⬇️ **Download Link:**\n`{dl_link}`\n\n"
            f"🏪 **Storage Msg ID:** `{storage_msg_id}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _StreamDrop Activity Log_"
        )

        # Send the log text
        await bot.send_message(Config.LOG_CHANNEL, text, disable_web_page_preview=True)

        # Also forward the actual file from storage channel for reference
        try:
            await bot.forward_messages(
                chat_id=Config.LOG_CHANNEL,
                from_chat_id=Config.STORAGE_CHANNEL,
                message_ids=storage_msg_id
            )
        except Exception:
            pass  # Forward may fail if bot is not in storage channel as admin
    except Exception:
        print(f"[LOG ERROR] log_file_upload:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: /showplan or premium interest
# ═══════════════════════════════════════════════════════════
async def log_showplan(user, current_plan: str):
    """Called when a user checks /showplan — potential buyer."""
    try:
        Config = _config()
        bot    = _bot()
        text = (
            f"╔{DSEP}╗\n"
            f"  💰 USER VIEWED PLANS\n"
            f"╚{DSEP}╝\n\n"
            f"{_user_line(user)}\n\n"
            f"📊 **Current Plan:** `{current_plan.upper()}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"💡 _This user may want to upgrade. Reach out if needed!_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_showplan:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: PLAN SET BY ADMIN
# ═══════════════════════════════════════════════════════════
async def log_plan_set(admin_user, target_id: int, plan_name: str, expiry_date=None):
    """Called when admin sets a plan for a user via /setplan."""
    try:
        Config = _config()
        bot    = _bot()
        expiry_str = expiry_date.strftime("%d %b %Y") if expiry_date else "Lifetime"
        text = (
            f"╔{DSEP}╗\n"
            f"  🎖 PLAN SET BY ADMIN\n"
            f"╚{DSEP}╝\n\n"
            f"👑 **Admin:** {_user_line(admin_user)}\n\n"
            f"{SEP}\n"
            f"🎯 **Target User ID:** `{target_id}`\n"
            f"💎 **Plan Assigned:** `{plan_name.upper()}`\n"
            f"📅 **Valid Until:** `{expiry_str}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _Admin Action Log_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_plan_set:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: USER BANNED / UNBANNED
# ═══════════════════════════════════════════════════════════
async def log_ban_action(admin_user, target_id: int, action: str):
    """Called when admin bans or unbans a user."""
    try:
        Config = _config()
        bot    = _bot()
        icon   = "🚫" if action == "ban" else "✅"
        label  = "USER BANNED" if action == "ban" else "USER UNBANNED"
        text = (
            f"╔{DSEP}╗\n"
            f"  {icon} {label}\n"
            f"╚{DSEP}╝\n\n"
            f"👑 **Admin:** {admin_user.first_name} (`{admin_user.id}`)\n\n"
            f"{SEP}\n"
            f"🎯 **Target User ID:** `{target_id}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _Admin Action Log_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_ban_action:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: LIMIT REACHED (user hit daily cap)
# ═══════════════════════════════════════════════════════════
async def log_limit_hit(user, count: int, limit: int):
    """Called when a free user hits their daily upload limit."""
    try:
        Config = _config()
        bot    = _bot()
        text = (
            f"╔{DSEP}╗\n"
            f"  ⛔ DAILY LIMIT REACHED\n"
            f"╚{DSEP}╝\n\n"
            f"{_user_line(user)}\n\n"
            f"📊 **Uploads Today:** `{count} / {limit}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"💡 _Reached free limit — potential premium convert!_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_limit_hit:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: FORCE SUB CHECK FAIL
# ═══════════════════════════════════════════════════════════
async def log_force_sub_fail(user):
    """Called when a user fails force-subscribe check."""
    try:
        Config = _config()
        bot    = _bot()
        text = (
            f"╔{DSEP}╗\n"
            f"  🔒 FORCE-SUB BLOCKED\n"
            f"╚{DSEP}╝\n\n"
            f"{_user_line(user)}\n\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _This user hasn't joined the required channel yet._"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_force_sub_fail:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: BROADCAST COMPLETED
# ═══════════════════════════════════════════════════════════
async def log_broadcast(admin_user, total: int, success: int, blocked: int, deleted: int, failed: int):
    """Called after a broadcast finishes."""
    try:
        Config = _config()
        bot    = _bot()
        text = (
            f"╔{DSEP}╗\n"
            f"  📢 BROADCAST COMPLETED\n"
            f"╚{DSEP}╝\n\n"
            f"👑 **By:** {admin_user.first_name} (`{admin_user.id}`)\n\n"
            f"{SEP}\n"
            f"👥 **Total Users:** `{total}`\n"
            f"✅ **Delivered:** `{success}`\n"
            f"🚫 **Blocked:** `{blocked}`\n"
            f"🗑 **Deleted Accounts:** `{deleted}`\n"
            f"⚠️ **Failed:** `{failed}`\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _Admin Action Log_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_broadcast:\n{traceback.format_exc()}")


# ═══════════════════════════════════════════════════════════
# LOG: BOT STARTED / RESTARTED
# ═══════════════════════════════════════════════════════════
async def log_bot_start():
    """Called at bot startup."""
    try:
        Config = _config()
        bot    = _bot()
        text = (
            f"╔{DSEP}╗\n"
            f"  ⚡ BOT STARTED / RESTARTED\n"
            f"╚{DSEP}╝\n\n"
            f"🤖 **Bot:** @{Config.BOT_USERNAME or 'StreamDrop'}\n"
            f"🌍 **Server:** Render Cloud\n"
            f"🕐 **Time:** `{_now()}`\n"
            f"{SEP}\n"
            f"📌 _System Event Log_"
        )
        await bot.send_message(Config.LOG_CHANNEL, text)
    except Exception:
        print(f"[LOG ERROR] log_bot_start:\n{traceback.format_exc()}")
