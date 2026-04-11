"""
Proper DC-aware media session management for multi-bot streaming.
Each worker bot creates its own authenticated media session per DC.
"""
import os

target = r'c:\ALL FINAL PROJECTS\BOTS\File-to-stream\app.py'
content = open(target, 'r', encoding='utf-8').read()

start_mark = 'class ByteStreamer:'
end_mark = '@bot.on_message(filters.command("workers")'

start_idx = content.find(start_mark)
end_idx = content.find(end_mark)

new_class = '''class ByteStreamer:
    _chunk_cache = {}   # Shared RAM cache: {(media_id, chunk_idx): bytes}
    _media_sessions = {}  # {(client_id, dc_id): Session}

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

    @classmethod
    async def get_media_session(cls, client: Client, dc_id: int):
        """Get or create a DC-authenticated media session for the client."""
        ckey = (id(client), dc_id)
        if ckey in cls._media_sessions:
            return cls._media_sessions[ckey]

        client_dc = await client.storage.dc_id()
        if dc_id == client_dc:
            # Same DC — use the existing session directly
            cls._media_sessions[ckey] = client.session
            return client.session

        # Different DC — need to create a new authenticated session
        try:
            auth = await Auth(client, dc_id, await client.storage.test_mode()).create()
            session = Session(
                client, dc_id, auth,
                await client.storage.test_mode(), is_media=True
            )
            await session.start()
            exported = await client.invoke(
                raw.functions.auth.ExportAuthorization(dc_id=dc_id)
            )
            await session.invoke(
                raw.functions.auth.ImportAuthorization(
                    id=exported.id, bytes=exported.bytes
                )
            )
            cls._media_sessions[ckey] = session
            print(f"✅ Media session created: client={id(client)} dc={dc_id}")
            return session
        except Exception as e:
            print(f"⚠️ Media session failed for dc={dc_id}: {e}. Falling back to main session.")
            cls._media_sessions[ckey] = client.session
            return client.session

    async def fetch_chunk_from_client(self, client: Client, f: FileId, loc, offset: int, limit: int):
        """Fetch a chunk using this specific client with proper DC session."""
        for attempt in range(3):
            try:
                ms = await self.get_media_session(client, f.dc_id)
                r = await asyncio.wait_for(
                    ms.invoke(
                        raw.functions.upload.GetFile(location=loc, offset=offset, limit=limit),
                        retries=2
                    ),
                    timeout=12
                )
                if isinstance(r, raw.types.upload.File):
                    return r.bytes
                break
            except FloodWait as e:
                await asyncio.sleep(min(e.value, 3) + 1)
            except Exception as e:
                if attempt == 2:
                    print(f"fetch_chunk failed after 3 attempts: {e}")
                await asyncio.sleep(0.5 * (attempt + 1))
        return None

    async def yield_file(self, f: FileId, client_id: int, start_byte: int, end_byte: int, chunk_size: int):
        work_loads[client_id] = work_loads.get(client_id, 0) + 1
        loc = await self.get_location(f)
        current_pos = start_byte
        bytes_remaining = end_byte - start_byte + 1

        # Build the ordered client rotation list
        # client_id determines which bot "owns" this stream request
        master_client = multi_clients.get(client_id) or bot
        all_cls = [master_client, bot] + [c for c in multi_clients.values() if c is not master_client]
        clients = list({id(c): c for c in all_cls}.values())

        prefetch_tasks = {}

        async def do_fetch(c_idx: int):
            ckey = (f.media_id, c_idx)
            if ckey in self._chunk_cache:
                return self._chunk_cache[ckey]

            # Round-robin client selection for parallel prefetching
            client = clients[c_idx % len(clients)]
            data = await self.fetch_chunk_from_client(client, f, loc, c_idx * chunk_size, chunk_size)

            # Fallback to main bot if worker fails
            if data is None and client is not bot:
                data = await self.fetch_chunk_from_client(bot, f, loc, c_idx * chunk_size, chunk_size)

            if data is not None:
                if len(self._chunk_cache) > 200:
                    self._chunk_cache.clear()
                self._chunk_cache[ckey] = data
            return data

        try:
            while bytes_remaining > 0:
                chunk_index = current_pos // chunk_size

                if chunk_index in prefetch_tasks:
                    chunk_data = await prefetch_tasks.pop(chunk_index)
                else:
                    chunk_data = await do_fetch(chunk_index)

                if not chunk_data:
                    break

                # Aggressive prefetch: 4 chunks = 2MB ahead
                for lookahead in range(1, 5):
                    n_idx = chunk_index + lookahead
                    if n_idx not in prefetch_tasks and (current_pos + (lookahead * chunk_size) < end_byte + chunk_size):
                        prefetch_tasks[n_idx] = asyncio.create_task(do_fetch(n_idx))

                off = current_pos % chunk_size
                take = min(len(chunk_data) - off, bytes_remaining)
                if take <= 0:
                    break

                yield chunk_data[off: off + take]
                current_pos += take
                bytes_remaining -= take

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Streaming Aborted: {e}")
        finally:
            for t in prefetch_tasks.values():
                t.cancel()
            work_loads[client_id] -= 1

'''

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_class + content[end_idx:]
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Proper DC-aware multi-bot ByteStreamer applied.")
else:
    print(f"FAILED: start={start_idx} end={end_idx}")
