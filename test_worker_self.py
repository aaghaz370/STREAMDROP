import asyncio
import os
from pyrogram import Client
from dotenv import load_dotenv

async def main():
    load_dotenv()
    api_id = int(os.environ.get("API_ID"))
    api_hash = os.environ.get("API_HASH")
    worker_tokens = os.environ.get("MULTI_TOKENS", "").split(",")
    channel = int(os.environ.get("STORAGE_CHANNEL"))
    
    # We will use the first worker bot token
    worker_bot = Client("worker_test", api_id=api_id, api_hash=api_hash, bot_token=worker_tokens[0], in_memory=True)
    await worker_bot.start()
    
    try:
        # Assuming message ID 5 (or any recent message ID)
        # Let's search for a message ID dynamically
        m = None
        for i in range(100, 0, -1):
            try:
                msg = await worker_bot.get_messages(channel, i)
                if msg and not msg.empty and (msg.document or msg.video):
                    m = msg
                    break
            except Exception:
                pass
                
        if not m:
            print("Could not find any media message.")
            return
            
        print(f"Worker fetched message {m.id} successfully!")
        file_id = m.document.file_id if m.document else m.video.file_id
        
        print("Worker attempting to stream...")
        async for chunk in worker_bot.stream_media(file_id, limit=100000):
            print(f"Success! Fetched chunk of size {len(chunk)}")
            break
    except Exception as e:
        print(f"Worker failed: {e}")
        
    await worker_bot.stop()

if __name__ == "__main__":
    asyncio.run(main())
