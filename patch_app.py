import os
with open("app.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Import slowapi
code = code.replace(
    "from fastapi.staticfiles import StaticFiles\nimport math\n",
    "from fastapi.staticfiles import StaticFiles\nimport math\n\nfrom slowapi import Limiter, _rate_limit_exceeded_handler\nfrom slowapi.util import get_remote_address\nfrom slowapi.errors import RateLimitExceeded\n"
)

# 2. Setup Limiter
code = code.replace(
    'app = FastAPI(lifespan=lifespan)\n',
    'app = FastAPI(lifespan=lifespan, docs_url="/api/docs", redoc_url="/api/redoc", openapi_url="/api/openapi.json")\n\nlimiter = Limiter(key_func=get_remote_address)\napp.state.limiter = limiter\napp.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)\n'
)

# 3. Add Limiter to show_dashboard
code = code.replace(
    '@app.get("/show/{unique_id}")\nasync def show_dashboard(request: Request, unique_id: str):',
    '@app.get("/show/{unique_id}")\n@limiter.limit("30/minute")\nasync def show_dashboard(request: Request, unique_id: str):'
)

# 4. Add Limiter and Referer check to stream_media
stream_media_old = '''@app.get("/dl/{unique_id}/{fname}")
async def stream_media(r:Request, unique_id: str, fname: str):'''
stream_media_new = '''@app.get("/dl/{unique_id}/{fname}")
@limiter.limit("20/minute")
async def stream_media(request: Request, unique_id: str, fname: str):
    # Embed Protection: Block unauthorized external embedding
    referer = request.headers.get("referer")
    if referer:
        from urllib.parse import urlparse
        ref_domain = urlparse(referer).netloc
        base_domain = urlparse(Config.BASE_URL).netloc
        ref_domain_stripped = ref_domain.split(':')[0]
        base_domain_stripped = base_domain.split(':')[0]
        if ref_domain_stripped != base_domain_stripped and ref_domain_stripped not in Config.ALLOWED_EMBED_DOMAINS:
            raise HTTPException(status_code=403, detail=f"Streaming embedded on {ref_domain} is strictly prohibited by server.")
    r = request'''
code = code.replace(stream_media_old, stream_media_new)

# 5. Fix yield_file to cache FileId per bot
yield_file_old = '''    async def yield_file(self, f: FileId, client_id: int, start_byte: int, end_byte: int, chunk_size: int):
        work_loads[client_id] = work_loads.get(client_id, 0) + 1
        loc = await self.get_location(f)
        current_pos = start_byte
        bytes_remaining = end_byte - start_byte + 1

        # Build the ordered client rotation list
        # client_id determines which bot "owns" this stream request
        master_client = multi_clients.get(client_id) or bot
        all_cls = [master_client, bot] + [c for c in multi_clients.values() if c is not master_client]
        clients = list({id(c): c for c in all_cls}.values())'''

yield_file_new = '''    _bot_file_reference_cache = {} # {(bot_id, media_id): FileId}

    async def yield_file(self, f: FileId, client_id: int, start_byte: int, end_byte: int, chunk_size: int, mid: int = None):
        work_loads[client_id] = work_loads.get(client_id, 0) + 1
        current_pos = start_byte
        bytes_remaining = end_byte - start_byte + 1

        if multi_clients:
            clients = list(multi_clients.values())
        else:
            clients = [bot]'''
code = code.replace(yield_file_old, yield_file_new)

# 6. Fallback inside yield_file logic
fetch_chunk_old = '''            # Round-robin client selection for parallel prefetching
            client = clients[c_idx % len(clients)]
            data = await self.fetch_chunk_from_client(client, f, loc, c_idx * chunk_size, chunk_size)

            # Fallback to main bot if worker fails
            if data is None and client is not bot:
                data = await self.fetch_chunk_from_client(bot, f, loc, c_idx * chunk_size, chunk_size)'''

fetch_chunk_new = '''            # Round-robin client selection for parallel prefetching
            client = clients[c_idx % len(clients)]
            
            # Use bot's own file reference
            bot_id = id(client)
            ref_key = (bot_id, f.media_id)
            if ref_key not in self._bot_file_reference_cache:
                if client is bot:
                    self._bot_file_reference_cache[ref_key] = f
                else:
                    try:
                        msg = await client.get_messages(Config.STORAGE_CHANNEL, mid)
                        m = msg.document or msg.video or msg.audio or msg.photo
                        if m:
                            self._bot_file_reference_cache[ref_key] = FileId.decode(m.file_id)
                        else:
                            self._bot_file_reference_cache[ref_key] = f
                    except Exception as e:
                        print(f"Failed to fetch file reference for worker {bot_id}: {e}")
                        self._bot_file_reference_cache[ref_key] = f
                        
            bot_fid = self._bot_file_reference_cache.get(ref_key, f)
            bot_loc = await self.get_location(bot_fid)
            
            data = await self.fetch_chunk_from_client(client, bot_fid, bot_loc, c_idx * chunk_size, chunk_size)

            # Fallback to next worker if current fails
            if data is None and len(clients) > 1:
                next_client = clients[(c_idx + 1) % len(clients)]
                next_bot_id = id(next_client)
                next_ref_key = (next_bot_id, f.media_id)
                if next_ref_key not in self._bot_file_reference_cache:
                    if next_client is bot:
                        self._bot_file_reference_cache[next_ref_key] = f
                    else:
                        try:
                            msg = await next_client.get_messages(Config.STORAGE_CHANNEL, mid)
                            m = msg.document or msg.video or msg.audio or msg.photo
                            if m:
                                self._bot_file_reference_cache[next_ref_key] = FileId.decode(m.file_id)
                            else:
                                self._bot_file_reference_cache[next_ref_key] = f
                        except Exception:
                            self._bot_file_reference_cache[next_ref_key] = f
                next_bot_fid = self._bot_file_reference_cache.get(next_ref_key, f)
                next_bot_loc = await self.get_location(next_bot_fid)
                data = await self.fetch_chunk_from_client(next_client, next_bot_fid, next_bot_loc, c_idx * chunk_size, chunk_size)

            # Ultimate fallback to main bot if workers fail (e.g. they aren't admins in storage channel)
            if data is None and client is not bot:
                print(f"⚠️ Workers failed to fetch chunk {c_idx}. Are they added to STORAGE_CHANNEL? Falling back to Main Bot.")
                try:
                    await bot.send_message(Config.LOG_CHANNEL, f"⚠️ **Worker Bot Failed!**\\nA worker bot failed to fetch a chunk for file `{f.media_id}`.\\nFalling back to Main Bot.\\n**Action Required:** Please ensure ALL worker bots are added as **Admin** in the Storage Channel.")
                except Exception:
                    pass
                bot_loc_fb = await self.get_location(f)
                data = await self.fetch_chunk_from_client(bot, f, bot_loc_fb, c_idx * chunk_size, chunk_size)'''
code = code.replace(fetch_chunk_old, fetch_chunk_new)

# 7. Pass mid in yield_file call inside stream_media
stream_yield_old = '''        body = tc.yield_file(fid, client_id, fb, ub, cs)'''
stream_yield_new = '''        body = tc.yield_file(fid, client_id, fb, ub, cs, mid=mid)'''
code = code.replace(stream_yield_old, stream_yield_new)

with open("app.py", "w", encoding="utf-8") as f:
    f.write(code)
print("Updated app.py")
