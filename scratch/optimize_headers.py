import os
import asyncio

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

# 1. Update Content-Disposition to use UTF-8 Safe Encoding (Fixes browser stream errors)
# 2. Reduce Chunk Size to 512KB for better stability on Render
# 3. Fix the double-quote error in Content-Disposition

old_hdr_block = """        disp = "attachment" if r.query_params.get("download") else "inline"
        hdrs = {
            "Content-Type": _mime,
            "Accept-Ranges": "bytes",
            "Content-Disposition": f'{disp}; filename="{_fname}"',
            "Content-Length": str(rl)
        }"""

new_hdr_block = """        disp = "attachment" if r.query_params.get("download") else "inline"
        from urllib.parse import quote
        safe_fname = quote(_fname)
        
        hdrs = {
            "Content-Type": _mime,
            "Accept-Ranges": "bytes",
            "Content-Disposition": f"{disp}; filename*=UTF-8''{safe_fname}",
            "Content-Length": str(rl)
        }"""

old_cs = "cs = 1024 * 1024"
new_cs = "cs = 512 * 1024"

if old_hdr_block in content:
    content = content.replace(old_hdr_block, new_hdr_block)
    content = content.replace(old_cs, new_cs)
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Header and Chunk Size optimized.")
else:
    print("FAILED: Could not find header block.")
