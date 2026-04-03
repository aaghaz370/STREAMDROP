# logger.py — Advanced Log Channel System for StreamDrop Bot
# Design: No circular imports. Call L.init(bot, Config) once after bot starts.

import datetime
import traceback
import html

# ─── Module-level state (set via init()) ─────────────────────
_BOT    = None
_CONFIG = None

def init(bot_instance, config_class):
    """Call this once after the Pyrogram bot is started."""
    global _BOT, _CONFIG
    _BOT    = bot_instance
    _CONFIG = config_class
    print(f"[LOGGER] Initialized. Log channel: {config_class.LOG_CHANNEL}")

# ─── Dividers ─────────────────────────────────────────────────
SEP  = "─" * 32
DSEP = "═" * 32

import json
import urllib.request
import asyncio

async def _fallback_send_message(chat_id: int, text: str):
    """Bypass Pyrogram completely and hit Telegram HTTP API. Perfect for fresh deploys."""
    bot_token = _CONFIG.BOT_TOKEN
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    def fetch():
        urllib.request.urlopen(req, timeout=5)
    await asyncio.to_thread(fetch)

async def _safe_send_message(text: str):
    """Attempts Pyrogram send, automatically falls back to raw HTTP API if peer cache is empty."""
    chat_id = _CONFIG.LOG_CHANNEL
    try:
        from pyrogram import enums
        await _BOT.send_message(chat_id, text, disable_web_page_preview=True, parse_mode=enums.ParseMode.HTML)
    except Exception as e:
        # If Pyrogram complains it hasn't seen the channel (common on Render restarts)
        err_str = str(e).lower()
        if "peer" in err_str or "chat" in err_str or "forbidden" in err_str:
            try:
                await _fallback_send_message(chat_id, text)
            except Exception as e2:
                print(f"[LOG ERROR] Final HTTP fallback failed: {e2}")
        else:
            try:
                # 100% blind fallback just in case
                await _fallback_send_message(chat_id, text)
            except:
                print(f"[LOG ERROR] Pyrogram and Fallback both failed: e={e}")

def _now() -> str:
    return datetime.datetime.now().strftime("%d %b %Y  •  %I:%M:%S %p")

def _user_block(user) -> str:
    """Render a clean user info block from a Pyrogram User object."""
    if not user:
        return "👤 Unknown User"
    name  = f"{user.first_name or ''} {user.last_name or ''}".strip() or "No Name"
    uname = f"@{user.username}" if user.username else "<i>(no username)</i>"
    uid   = user.id
    tg_plan = "💎 Telegram Premium" if getattr(user, "is_premium", False) else "🆓 Free Account"
    profile = f"tg://user?id={uid}"
    
    # HTML escape name to prevent parsing errors
    name = html.escape(name)
    
    return (
        f"👤 <b>Name:</b> <a href=\"{profile}\">{name}</a>\n"
        f"🆔 <b>User ID:</b> <code>{uid}</code>\n"
        f"🔗 <b>Username:</b> {uname}\n"
        f"✨ <b>Telegram:</b> {tg_plan}"
    )

def _header(icon: str, title: str) -> str:
    return f"<b>{icon} {title}</b>\n{SEP}"

def _footer() -> str:
    return f"{SEP}\n🕐 <code>{_now()}</code>\n📌 <i>StreamDrop Activity Log</i>"

def _ready() -> bool:
    if _BOT is None or _CONFIG is None:
        print("[LOGGER] Not initialized — call L.init(bot, Config) first.")
        return False
    return True


# ═════════════════════════════════════════════════════════════
# LOG: BOT STARTED / RESTARTED
# ═════════════════════════════════════════════════════════════

async def _report_error(func_name: str, tb_str: str):
    print(f"[LOG ERROR] {func_name}:\n{tb_str}")
    if _BOT and _CONFIG and getattr(_CONFIG, 'OWNER_ID', None):
        try:
            await _BOT.send_message(
                _CONFIG.OWNER_ID, 
                f"⚠️ **LOGGER ERROR in {func_name}**\n\n```python\n{tb_str[:3800]}\n```"
            )
        except Exception:
            pass

async def log_bot_start():
    if not _ready(): return
    try:
        text = (
            f"{_header('⚡', 'BOT STARTED / RESTARTED')}\n\n"
            f"🤖 <b>Bot:</b> @{_CONFIG.BOT_USERNAME or 'STREAM_DROP_BOT'}\n"
            f"🌍 <b>Server:</b> Render Cloud\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_bot_start", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: NEW USER / RETURNING USER
# ═════════════════════════════════════════════════════════════
async def log_new_user(user, is_new: bool = True):
    if not _ready(): return
    try:
        label = "🆕 NEW USER REGISTERED" if is_new else "👋 USER RETURNED"
        text = (
            f"{_header('👤', label)}\n\n"
            f"{_user_block(user)}\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_new_user", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: FILE UPLOADED / LINK CREATED
# ═════════════════════════════════════════════════════════════
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
    if not _ready(): return
    try:
        if mime_type.startswith("video"):   ficon = "🎬 Video"
        elif mime_type.startswith("audio"): ficon = "🎵 Audio"
        elif mime_type == "application/pdf":ficon = "📄 PDF"
        elif mime_type.startswith("image"): ficon = "🖼 Image"
        else:                               ficon = "📦 Document"

        expiry_str = expiry_date.strftime("%d %b %Y") if expiry_date else "Never (No Expiry)"
        plan_label = "💎 Premium" if plan_type != "free" else "🆓 Free"

        text = (
            f"{_header('📤', 'NEW LINK CREATED')}\n\n"
            f"{_user_block(user)}\n"
            f"📊 <b>Plan:</b> {plan_label}\n\n"
            f"{'─'*32}\n"
            f"📁 <b>File:</b> <code>{html.escape(file_name)}</code>\n"
            f"💾 <b>Size:</b> <code>{file_size}</code>\n"
            f"🗂 <b>Type:</b> {ficon}\n"
            f"🔑 <b>ID:</b> <code>{unique_id}</code>\n"
            f"⏳ <b>Expires:</b> <code>{expiry_str}</code>\n\n"
            f"🌐 <b>Stream:</b> {page_link}\n"
            f"⬇️ <b>Download:</b> {dl_link}\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)

        # Forward actual file from storage channel for quick preview
        try:
            await _BOT.forward_messages(
                chat_id=_CONFIG.LOG_CHANNEL,
                from_chat_id=_CONFIG.STORAGE_CHANNEL,
                message_ids=storage_msg_id
            )
        except Exception as e:
            # If pyrogram fails, attempt a raw HTTP copyMessage (bots can copy cross-channel if admin)
            try:
                bot_token = _CONFIG.BOT_TOKEN
                url = f"https://api.telegram.org/bot{bot_token}/copyMessage"
                import json, urllib.request, asyncio
                payload = json.dumps({
                    "chat_id": _CONFIG.LOG_CHANNEL,
                    "from_chat_id": _CONFIG.STORAGE_CHANNEL,
                    "message_id": storage_msg_id
                }).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                def copy_fetch():
                    urllib.request.urlopen(req, timeout=5)
                await asyncio.to_thread(copy_fetch)
            except Exception as e2:
                print(f"[LOG ERROR] HTTP forward failed: {e2}")

    except Exception:
        await _report_error("log_file_upload", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: USER VIEWED PLANS (/showplan)
# ═════════════════════════════════════════════════════════════
async def log_showplan(user, current_plan: str):
    if not _ready(): return
    try:
        text = (
            f"{_header('💰', 'USER VIEWED PLANS')}\n\n"
            f"{_user_block(user)}\n\n"
            f"📊 <b>Current Plan:</b> <code>{current_plan.upper()}</code>\n\n"
            f"💡 <i>Potential upgrade — reach out if needed!</i>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_showplan", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: PLAN SET BY ADMIN
# ═════════════════════════════════════════════════════════════
async def log_plan_set(admin_user, target_id: int, plan_name: str, expiry_date=None):
    if not _ready(): return
    try:
        expiry_str = expiry_date.strftime("%d %b %Y") if expiry_date else "Lifetime / Never"
        text = (
            f"{_header('🎖', 'PLAN SET BY ADMIN')}\n\n"
            f"👑 <b>Admin:</b> {admin_user.first_name} (<code>{admin_user.id}</code>)\n\n"
            f"{'─'*32}\n"
            f"🎯 <b>Target User ID:</b> <code>{target_id}</code>\n"
            f"💎 <b>Plan:</b> <code>{plan_name.upper()}</code>\n"
            f"📅 <b>Valid Until:</b> <code>{expiry_str}</code>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_plan_set", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: USER BANNED / UNBANNED
# ═════════════════════════════════════════════════════════════
async def log_ban_action(admin_user, target_id: int, action: str):
    if not _ready(): return
    try:
        icon  = "🚫" if action == "ban" else "✅"
        label = "USER BANNED" if action == "ban" else "USER UNBANNED"
        text = (
            f"{_header(icon, label)}\n\n"
            f"👑 <b>Admin:</b> {admin_user.first_name} (<code>{admin_user.id}</code>)\n"
            f"🎯 <b>Target User ID:</b> <code>{target_id}</code>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_ban_action", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: DAILY LIMIT HIT
# ═════════════════════════════════════════════════════════════
async def log_limit_hit(user, count: int, limit: int):
    if not _ready(): return
    try:
        text = (
            f"{_header('⛔', 'DAILY LIMIT REACHED')}\n\n"
            f"{_user_block(user)}\n\n"
            f"📊 <b>Uploads Today:</b> <code>{count} / {limit}</code>\n"
            f"💡 <i>Potential premium convert!</i>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_limit_hit", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: FORCE-SUB BLOCKED
# ═════════════════════════════════════════════════════════════
async def log_force_sub_fail(user):
    if not _ready(): return
    try:
        text = (
            f"{_header('🔒', 'FORCE-SUB BLOCKED')}\n\n"
            f"{_user_block(user)}\n\n"
            f"📌 <i>User has not joined the required channel.</i>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_force_sub_fail", traceback.format_exc())


# ═════════════════════════════════════════════════════════════
# LOG: BROADCAST COMPLETED
# ═════════════════════════════════════════════════════════════
async def log_broadcast(admin_user, total: int, success: int, blocked: int, deleted: int, failed: int):
    if not _ready(): return
    try:
        text = (
            f"{_header('📢', 'BROADCAST COMPLETED')}\n\n"
            f"👑 <b>By:</b> {admin_user.first_name} (<code>{admin_user.id}</code>)\n\n"
            f"{'─'*32}\n"
            f"👥 <b>Total:</b> <code>{total}</code>\n"
            f"✅ <b>Delivered:</b> <code>{success}</code>\n"
            f"🚫 <b>Blocked:</b> <code>{blocked}</code>\n"
            f"🗑 <b>Deleted Accounts:</b> <code>{deleted}</code>\n"
            f"⚠️ <b>Failed:</b> <code>{failed}</code>\n\n"
            f"{_footer()}"
        )
        await _safe_send_message(text)
    except Exception:
        await _report_error("log_broadcast", traceback.format_exc())
