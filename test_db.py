import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def main():
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL")
    client = AsyncIOMotorClient(db_url)
    db = client["streamdrop"]
    col = db["links"]
    doc = await col.find_one({"_id": "XHw4kBPHQaU"})
    if doc:
        print(f"Message ID: {doc.get('message_id')}")
    else:
        print("Not found")

if __name__ == "__main__":
    asyncio.run(main())
