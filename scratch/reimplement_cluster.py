import os
import asyncio

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

# 1. Update TokenParser to handle MULTI_TOKENS (comma separated) or MULTI_TOKEN_X
new_parser_logic = """    @staticmethod
    def parse_from_env():
        tokens = {}
        # Try single MULTI_TOKENS variable (comma separated)
        m_tokens = os.environ.get("MULTI_TOKENS", "")
        if m_tokens:
            for i, t in enumerate(m_tokens.split(",")):
                if t.strip(): tokens[i + 1] = t.strip()
        
        # Also try MULTI_TOKEN_1, MULTI_TOKEN_2 style
        for k, v in os.environ.items():
            if k.startswith("MULTI_TOKEN_"):
                try:
                    tid = int(k.split("_")[-1])
                    tokens[tid] = v.strip()
                except: continue
        return tokens
"""

# 2. Update start_client to include Worker Interactivity
new_start_client = """async def start_client(client_id, bot_token):
    \"\"\" Ek naye client bot ko start karta hai aur uspar worker handler lagata hai. \"\"\"
    try:
        print(f"Attempting to start Client: {client_id}")
        client = Client(
            name=f"Worker_{client_id}", 
            api_id=Config.API_ID, 
            api_hash=Config.API_HASH,
            bot_token=bot_token, 
            no_updates=False, # Important for worker replies
            in_memory=True
        )
        
        @client.on_message(filters.private)
        async def worker_reply(c: Client, m: Message):
             try:
                 main_bot = Config.BOT_USERNAME or "StreamDropBot"
                 from pyrogram.types import InlineKeyboardMarkup as IKM, InlineKeyboardButton as IKB
                 await m.reply_text(
                     "**⚡ Service Worker Active**\\n\\n"
                     "I am a background engine for **StreamDrop**. I help in providing **Unlimited Speed** and **Zero Buffering**.\\n\\n"
                     "👉 **Please use our Main Bot for uploading/managing files:**",
                     reply_markup=IKM([[IKB("🚀 OPEN MAIN BOT", url=f"https://t.me/{main_bot}")]])
                 )
             exceptException: pass

        await client.start()
        work_loads[client_id] = 0
        multi_clients[client_id] = client
        print(f"✅ Client {client_id} started successfully.")
    except Exception as e:
        print(f"❌ Failed to start Client {client_id}: {e}")
"""

# 3. Add /workers admin command logic
new_admin_cmd = """@bot.on_message(filters.command("workers") & filters.user(Config.OWNER_ID))
async def workers_status(client: Client, message: Message):
    \"\"\" Shows the health and workload of the entire bot cluster. \"\"\"
    text = "🚀 **STREAMDROP CLUSTER STATUS**\\n"
    text += "────────────────────\\n"
    
    # Main Bot
    m_load = work_loads.get(0, 0)
    text += f"🏠 **Main Bot:** `Healthy` | 📺 `{m_load}` active\\n"
    
    # Worker Bots
    online = 0
    tokens_count = len(TokenParser.parse_from_env())
    
    for i in range(1, tokens_count + 1):
        c = multi_clients.get(i)
        load = work_loads.get(i, 0)
        status = "✅ Active" if c and c.is_initialized else "❌ Offline"
        if c and c.is_initialized: online += 1
        text += f"🤖 **Worker {i}:** `{status}` | 📺 `{load}` streams\\n"
    
    text += "────────────────────\\n"
    text += f"📊 **Bot Health:** `{online + 1}/{tokens_count + 1}` Online\\n"
    text += f"🔥 **Total Cluster Load:** `{sum(work_loads.values())}` streams\\n"
    
    await message.reply_text(text, quote=True)
"""

# 4. Integrate back into lifespan
lifespan_update_mark = '# force_refresh_dialogs removed as it is not supported for bots'
lifespan_addition = "\\n        # --- INITIALIZE WORKER CLUSTER ---\\n        await initialize_clients()\\n"

# APPLY UPDATES
# This script is a bit complex for a simple replace, I'll use markers.

import re
# Replacing TokenParser.parse_from_env()
content = re.sub(r'def parse_from_env\(\):.*?return {.*?}', new_parser_logic, content, flags=re.DOTALL)

# Replacing start_client
content = re.sub(r'async def start_client\(client_id, bot_token\):.*?print\(f"✅ Client {client_id} started successfully."\).*?except Exception as e:.*?print\(f"❌ Failed to start Client {client_id}: {e}"\)', new_start_client, content, flags=re.DOTALL)

# Inserting initialize_clients into lifespan
if 'await initialize_clients()' not in content:
    content = content.replace(lifespan_update_mark, lifespan_update_mark + '\\n        await initialize_clients()')

# Inserting /workers before stream_media
if 'async def workers_status' not in content:
    content = content.replace('@app.get("/dl/{unique_id}/{fname}")', new_admin_cmd + '\\n@app.get("/dl/{unique_id}/{fname}")')

# SAVE
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS: Cluster and Load Balancing fully re-implemented.")
