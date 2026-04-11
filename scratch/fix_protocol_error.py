import os
import asyncio

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

# Replace ByteStreamer with a HIGHTLY STABLE version.
# Pyrogram's native .invoke() handles sessions automatically.
# Manual session management during yield is causing the ERR_QUIC_PROTOCOL_ERROR.

start_mark = 'class ByteStreamer:'
end_mark = '@app.get("/dl/{unique_id}/{fname}")'

start_idx = content.find(start_mark)
end_idx = content.find(end_mark)

new_class = """class ByteStreamer:
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

    async def fetch_chunk(self, client, loc, offset, limit):
        # Native safe fetch
        for _ in range(3):
            try:
                r = await asyncio.wait_for(
                    client.invoke(raw.functions.upload.GetFile(location=loc, offset=offset, limit=limit), retries=2),
                    timeout=10
                )
                if isinstance(r, raw.types.upload.File):
                    return r.bytes
                break
            except FloodWait as e:
                await asyncio.sleep(min(e.value, 3) + 1)
            except:
                await asyncio.sleep(0.5)
        return None

    async def yield_file(self, f: FileId, client_id: int, start_byte: int, end_byte: int, chunk_size: int):
        work_loads[client_id] = work_loads.get(client_id, 0) + 1
        loc = await self.get_location(f)
        current_pos = start_byte
        bytes_remaining = end_byte - start_byte + 1
        
        # Use cluster for prefetching ONLY
        all_cls = [bot] + list(multi_clients.values())
        clients = list({id(c): c for c in all_cls}.values())
        
        prefetch_tasks = {}
        
        async def do_fetch(c_idx):
            ckey = (f.media_id, c_idx)
            if ckey in self._chunk_cache: return self._chunk_cache[ckey]
            
            c = clients[c_idx % len(clients)]
            data = await self.fetch_chunk(c, loc, c_idx * chunk_size, chunk_size)
            if data:
                if len(self._chunk_cache) > 100: self._chunk_cache.clear()
                self._chunk_cache[ckey] = data
            return data

        try:
            while bytes_remaining > 0:
                chunk_index = current_pos // chunk_size
                
                # Immediate Fetch or Prefetch result
                if chunk_index in prefetch_tasks:
                    chunk_data = await prefetch_tasks.pop(chunk_index)
                else:
                    chunk_data = await do_fetch(chunk_index)
                
                if not chunk_data: break
                
                # Prefetch next 2 chunks (User requested 2MB, using 2 * 512KB for stability)
                for lookahead in range(1, 3):
                    n_idx = chunk_index + lookahead
                    if n_idx not in prefetch_tasks and (current_pos + (lookahead * chunk_size) < end_byte + chunk_size):
                        prefetch_tasks[n_idx] = asyncio.create_task(do_fetch(n_idx))
                
                off = current_pos % chunk_size
                take = min(len(chunk_data)-off, bytes_remaining)
                if take <= 0: break
                
                yield chunk_data[off : off+take]
                current_pos += take
                bytes_remaining -= take
                
        except Exception as e:
            print(f"Streaming Aborted: {e}")
        finally:
            for t in prefetch_tasks.values(): t.cancel()
            work_loads[client_id] -= 1

"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_class + content[end_idx:]
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED")
