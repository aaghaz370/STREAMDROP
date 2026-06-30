import asyncio
import os
from pyrogram import Client
from dotenv import load_dotenv

async def main():
    load_dotenv()
    api_id = os.environ.get("API_ID")
    api_hash = os.environ.get("API_HASH")
    main_token = os.environ.get("BOT_TOKEN")
    worker_tokens = os.environ.get("MULTI_TOKENS", "").split(",")
    channel = int(os.environ.get("STORAGE_CHANNEL"))
    
    # 1. Main bot fetches message to get file_id
    main_bot = Client("main", api_id=api_id, api_hash=api_hash, bot_token=main_token, in_memory=True)
    await main_bot.start()
    
    print("Fetching history...")
    msgs = []
    async for m in main_bot.get_chat_history(channel, limit=10):
        if m.document or m.video:
            msgs.append(m)
            break
            
    if not msgs:
        print("No media found.")
        return
        
    m = msgs[0]
    file_id = m.document.file_id if m.document else m.video.file_id
    print(f"File ID: {file_id}")
    
    # 2. Worker bot tries to download using this file_id
    worker_bot = Client("worker", api_id=api_id, api_hash=api_hash, bot_token=worker_tokens[0], in_memory=True)
    await worker_bot.start()
    
    try:
        print("Worker bot attempting to download...")
        # Just fetch 1 chunk using get_file
        async for chunk in worker_bot.stream_media(file_id, limit=100000):
            print("Successfully downloaded a chunk with worker bot!")
            break
    except Exception as e:
        print(f"Worker bot failed: {e}")
        
    await main_bot.stop()
    await worker_bot.stop()

if __name__ == "__main__":
    asyncio.run(main())
