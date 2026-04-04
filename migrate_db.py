import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

from config import Config

NEW_DB_URL = "mongodb+srv://streamdrop:aaghaz9431@streamdrop.boddtlb.mongodb.net/?appName=streamdrop"

async def migrate():
    print("Connecting to PRIMARY DB...")
    client1 = AsyncIOMotorClient(Config.DATABASE_URL)
    db1 = client1["UnivoraStreamDrop"]
    
    print("Connecting to BACKUP DB...")
    client2 = AsyncIOMotorClient(NEW_DB_URL)
    db2 = client2["UnivoraStreamDrop"]
    
    # 1. Migrate Links
    print("Migrating Links...")
    links = await db1.links.find().to_list(length=None)
    if links:
        # Clear destination to avoid duplicate key errors during complete sync
        await db2.links.delete_many({})
        await db2.links.insert_many(links)
        print(f"✅ Migrated {len(links)} links.")
    
    # 2. Migrate Users
    print("Migrating Users...")
    users = await db1.users.find().to_list(length=None)
    if users:
        await db2.users.delete_many({})
        await db2.users.insert_many(users)
        print(f"✅ Migrated {len(users)} users.")
        
    # 3. Migrate Banned
    print("Migrating Banned Accounts...")
    banned = await db1.banned.find().to_list(length=None)
    if banned:
        await db2.banned.delete_many({})
        await db2.banned.insert_many(banned)
        print(f"✅ Migrated {len(banned)} banned users.")
        
    # 4. Migrate Sessions
    print("Migrating Sessions...")
    sessions = await db1.sessions.find().to_list(length=None)
    if sessions:
        await db2.sessions.delete_many({})
        await db2.sessions.insert_many(sessions)
        print(f"✅ Migrated {len(sessions)} sessions.")
        
    print("✅ All databases successfully mirrored!")
    
    client1.close()
    client2.close()

if __name__ == "__main__":
    asyncio.run(migrate())
