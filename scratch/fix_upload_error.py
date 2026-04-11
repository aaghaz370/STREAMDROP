import os

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

# Look for the specific block
old_block = """        else:
             file_name = getattr(media, "file_name", "Unknown_File")
             file_size_bytes = getattr(media, "file_size", 0)
             mime_type = getattr(media, "mime_type", "application/octet-stream") or "application/octet-stream"

        file_size = get_readable_file_size(file_size_bytes)"""

new_block = """        else:
             # Media detection with robust fallbacks for Reels/No-name files
             file_name = getattr(media, "file_name", None)
             file_size_bytes = getattr(media, "file_size", 0)
             mime_type = getattr(media, "mime_type", "application/octet-stream") or "application/octet-stream"
             if not file_name:
                 import mimetypes
                 ext = mimetypes.guess_extension(mime_type) or (".mp4" if "video" in mime_type else ".mp3" if "audio" in mime_type else ".bin")
                 file_name = f"Media_{unique_id}{ext}"

        # Sanitization: Ensure file_name is a string and safe for headers
        file_name = str(file_name).replace('"', '').replace("'", "")
        file_size = get_readable_file_size(file_size_bytes)"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(target, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: File name logic updated.")
else:
    # Try with different indentation or whitespace if it failed
    print("ERROR: Could not find the target block exactly. Checking variations...")
    # Check if maybe lines have trailing spaces
    import re
    # Simplified search
    pattern = r'else:\s+file_name = getattr\(media, "file_name", "Unknown_File"\)\s+file_size_bytes = getattr\(media, "file_size", 0\)\s+mime_type = getattr\(media, "mime_type", "application/octet-stream"\) or "application/octet-stream"\s+file_size = get_readable_file_size\(file_size_bytes\)'
    # This might be too complex. Let's just find the first part.
    start_mark = 'file_name = getattr(media, "file_name", "Unknown_File")'
    end_mark = 'file_size = get_readable_file_size(file_size_bytes)'
    
    start_idx = content.find(start_mark)
    end_idx = content.find(end_mark)
    
    if start_idx != -1 and end_idx != -1:
        # Re-construct from markers
        # We want to replace from the 'else:' above start_mark
        else_idx = content.rfind('else:', 0, start_idx)
        if else_idx != -1:
            final_content = content[:else_idx] + new_block + content[end_idx + len(end_mark):]
            with open(target, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print("SUCCESS: Applied fix using marker-based replacement.")
        else:
            print("ERROR: Could not find 'else:' anchor.")
    else:
        print(f"ERROR: Markers not found. start_idx={start_idx}, end_idx={end_idx}")
