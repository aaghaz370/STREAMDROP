<div align="center">
  <img src="https://i.imgur.com/your-logo.png" alt="StreamDrop Logo" width="150" />
  <h1>🚀 StreamDrop Bot</h1>
  <p><b>Advanced High-Speed Telegram File to Link Streaming Bot</b></p>
  
  <p>
    <a href="https://t.me/Univora88"><img src="https://img.shields.io/badge/Join-Telegram%20Channel-blue?style=for-the-badge&logo=telegram" alt="Telegram Channel"></a>
    <a href="https://univora.site"><img src="https://img.shields.io/badge/Website-Univora.site-indigo?style=for-the-badge&logo=vercel" alt="Website"></a>
  </p>
</div>

<hr>

## 🌟 Introduction

**StreamDrop** is an enterprise-grade Telegram bot that instantly converts Telegram files/videos into high-speed streaming and download links. Built with Python (Pyrogram & FastAPI) and React (Vite) for the frontend dashboard. 

It completely bypasses Telegram's single-bot bandwidth limitations by using a **Multi-Client Worker Architecture** and advanced **File Reference Caching**, making it capable of handling thousands of simultaneous users without buffering.

## ✨ Key Features

- **⚡ Multi-Worker Streaming:** Distributes load across 10+ worker bots. The main bot is 100% free from streaming load.
- **🚀 Advanced File Reference System:** Worker bots fetch and cache their own file references for uninterrupted streaming.
- **🛡️ Enterprise Security:** 
  - Anti-DDoS and Rate Limiting via `slowapi`.
  - Strict Embed Protection (CORS & Referer Checking) to prevent bandwidth theft.
- **🆘 Emergency Fallback Engine:** If all workers fail, the main bot acts as an emergency stream provider and alerts the admin via `LOG_CHANNEL`.
- **💎 Premium & Monetization:** Integrated with a payment dashboard, custom validity plans (30 days, 60 days, Lifetime).
- **📊 Real-time Dashboard:** Beautiful Glassmorphism UI built with React.

## 🛠️ Technology Stack

- **Backend:** Python 3.11, FastAPI, Pyrogram, Motor (Async MongoDB), SlowAPI
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Database:** MongoDB
- **Infrastructure:** Docker, Docker Compose, Nginx

## 🚀 Deployment (Docker / VPS)

Deploying StreamDrop is highly optimized for VPS environments (like DigitalOcean) to prevent memory leaks and out-of-memory (OOM) crashes.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/StreamDrop.git
   cd StreamDrop
   ```

2. **Configure Environment Variables:**
   Create a `.env` file with your credentials:
   ```env
   API_ID=your_api_id
   API_HASH=your_api_hash
   BOT_TOKEN=your_main_bot_token
   MULTI_TOKENS=worker_token_1,worker_token_2,...
   DATABASE_URL=mongodb+srv://...
   STORAGE_CHANNEL=-100...
   LOG_CHANNEL=-100...
   BASE_URL=http://your_domain_or_ip:8000
   ALLOWED_EMBED_DOMAINS=example.com,anotherexample.com
   ```
   *(Ensure ALL worker bots are added as Admins to the `STORAGE_CHANNEL`)*

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

## 🔒 Security Configuration
To allow specific domains to embed your videos, add them to `ALLOWED_EMBED_DOMAINS` in your `.env`. Any domain not on this list will receive a `403 Forbidden` error.

---
<div align="center">
  <i>Developed with ❤️ by the Univora Team</i><br>
  © 2026 Univora. All rights reserved.
</div>
