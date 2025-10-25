import asyncio
from pyrogram import enums

# Sirf bot ko import karo, baaki kuch nahi
from bot import bot
from config import Config

async def main():
    print("--- STARTING CHANNEL DIAGNOSTIC TOOL ---")
    
    # Bot ko start karo
    await bot.start()
    print(f"Bot [@{bot.me.username}] logged in successfully.")
    
    target_channel_id = Config.STORAGE_CHANNEL
    print(f"TARGET CHANNEL ID from ENV VARS is: {target_channel_id}\n")
    
    print("Fetching list of all channels/chats the bot is a member of...")
    found_channel = False
    
    try:
        # Bot jin-jin chats mein hai, unki list nikalo
        async for dialog in bot.get_dialogs():
            print(f" - Found Chat: '{dialog.chat.title}' | ID: {dialog.chat.id} | Type: {dialog.chat.type}")
            
            # Check karo ki kya yeh hamara target channel hai
            if dialog.chat.id == target_channel_id:
                print(f"\n✅✅✅ MATCH FOUND! The bot is a member of the target channel.")
                found_channel = True

                # Ab check karo ki bot admin hai ya nahi
                try:
                    member = await bot.get_chat_member(target_channel_id, "me")
                    if member.status in [enums.ChatMemberStatus.ADMINISTRATOR, enums.ChatMemberStatus.OWNER]:
                        print(f"✅✅✅ PERMISSION OK! Bot is an ADMIN with status: {member.status.value}")
                    else:
                        print(f"❌❌❌ PERMISSION ERROR! Bot is in the channel but IS NOT AN ADMIN. Status: {member.status.value}")
                except Exception as e:
                    print(f"❌❌❌ Could not check admin status. Error: {e}")

    except Exception as e:
        print(f"\n❌❌❌ An error occurred while getting dialogs: {e}")

    if not found_channel:
        print("\n❌❌❌ FATAL ERROR: The target channel ID was NOT FOUND in the list of channels the bot is a member of.")
        print("This confirms the 'PeerIdInvalid' error. The bot is NOT in the channel.")

    print("\n--- DIAGNOSTIC COMPLETE ---")
    await bot.stop()


if __name__ == "__main__":
    # Is temporary script ko chalao
    asyncio.run(main())
