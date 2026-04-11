import os
import asyncio
import traceback

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

# Replace ByteStreamer class entirely for safety
start_mark = 'class ByteStreamer:'
end_mark = '@app.get("/dl/{unique_id}/{fname}")'

start_idx = content.find(start_mark)
end_idx = content.find(end_mark)

new_class = """class ByteStreamer:
    # RAM Cache for 0 buffering
    _chunk_cache = {} 

    def __init__(self, c: Client):
        self.client = c

    @staticmethod
    async def get_location(f: FileId):
        from pyrogram.file_id import FileType
        if f.file_type == FileType.PHOTO:
            return raw.types.InputPhotoFileLocation(
                id=f.media_id, access_hash=f.access_hash,
                file_reference=f.file_reference, thumb_size=f.thumbnail_size or "y"
            )
        return raw.types.InputDocumentFileLocation(
            id=f.media_id, access_hash=f.access_hash,
            file_reference=f.file_reference, thumb_size=f.thumbnail_size
        )

    async def fetch_chunk(self, client_or_session, loc, offset, limit):
        for attempt in range(5):
            try:
                r = await asyncio.wait_for(
                    client_or_session.invoke(raw.functions.upload.GetFile(location=loc, offset=offset, limit=limit), retries=2),
                    timeout=15
                )
                if isinstance(r, raw.types.upload.File):
                    return r.bytes
            except FloodWait as e:
                await asyncio.sleep(min(e.value, 3) + 1)
            except Exception:
                await asyncio.sleep(0.3)
        return None

    async def yield_file(self, f: FileId, client_id: int, start_byte: int, end_byte: int, chunk_size: int):
        work_loads[client_id] = work_loads.get(client_id, 0) + 1
        
        # unique_id is needed for cache — we can derive it from the running context or pass it
        # Since tc is reconstructed per request or cached in class_cache, we can assume
        # a unique_id is available in the scope of stream_media. 
        # But wait, yield_file is a generator. We should find the unique_id.
        # Let's use the file_id media_id + access_hash as a stable cache key
        uid_key = f"{f.media_id}_{f.access_hash}"
        
        loc = await self.get_location(f)
        current_pos = start_byte
        bytes_remaining = end_byte - start_byte + 1
        
        # Parallel Cluster Setup
        all_cls = [bot] + list(multi_clients.values())
        clients = list({id(c): c for c in all_cls}.values())
        
        prefetch_tasks = {} # chunk_index -> task
        prefetch_limit = 4  # 4 * 1MB = 4MB pre-load (User asked for 2MB+, so 4MB is safer)
        
        async def fetch_distributed(c_idx):
            ckey = (uid_key, c_idx)
            if ckey in self._chunk_cache: return self._chunk_cache[ckey]
            
            pri_id = c_idx % len(clients)
            for rotate in range(min(4, len(clients))):
                try:
                    c = clients[(pri_id + rotate) % len(clients)]
                    if not c.is_initialized: continue
                    ms = c.media_sessions.get(f.dc_id) if hasattr(c, 'media_sessions') else c.session
                    if not ms: ms = c.session
                    
                    data = await self.fetch_chunk(ms, loc, c_idx * chunk_size, chunk_size)
                    if data:
                        if len(self._chunk_cache) > 200: self._chunk_cache.clear()
                        self._chunk_cache[ckey] = data
                        return data
                except: continue
            return None

        try:
            while bytes_remaining > 0:
                chunk_index = current_pos // chunk_size
                
                if chunk_index in prefetch_tasks:
                    chunk_data = await prefetch_tasks.pop(chunk_index)
                else:
                    for t in prefetch_tasks.values(): t.cancel()
                    prefetch_tasks = {}
                    chunk_data = await fetch_distributed(chunk_index)
                
                if chunk_data is None: break
                
                # Start prefetching next 4 chunks (4MB) parallelly
                for lookahead in range(1, prefetch_limit + 1):
                    next_idx = chunk_index + lookahead
                    if next_idx not in prefetch_tasks and (current_pos + (lookahead * chunk_size) < end_byte + chunk_size):
                        prefetch_tasks[next_idx] = asyncio.create_task(fetch_distributed(next_idx))
                
                off = current_pos % chunk_size
                if off >= len(chunk_data): break
                take = min(len(chunk_data) - off, bytes_remaining)
                yield chunk_data[off : off + take]
                
                current_pos += take
                bytes_remaining -= take
                
        except Exception as e:
            print(f"Stream Error: {e}")
        finally:
            for t in prefetch_tasks.values(): t.cancel()
            work_loads[client_id] -= 1

"""

if start_idx != -1 and end_idx != -1:
    final_content = content[:start_idx] + new_class + content[end_idx:]
    open(target, 'w', encoding='utf-8').write(final_content)
    print("SUCCESS")
else:
    print(f"FAILED: markers not found. start={start_idx} end={end_idx}")
