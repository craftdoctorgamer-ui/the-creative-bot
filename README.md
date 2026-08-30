# 🤖 The Creative Bot — Full Discord Bot

A complete Discord bot with Moderation, Music, and AI replies powered by Claude.

---

## ✅ Features

### 🛡️ Moderation
| Command | Description |
|---------|-------------|
| `/ban` | Ban a member with optional reason |
| `/kick` | Kick a member |
| `/timeout` | Mute a member for X minutes |
| `/warn` | Warn a member |
| `/clear` | Bulk delete messages (1-100) |

### 🎵 Music
| Command | Description |
|---------|-------------|
| `/play <query>` | Play from YouTube (name or URL) |
| `/music skip` | Skip current song |
| `/music stop` | Stop and leave voice channel |
| `/music pause` | Pause current song |
| `/music resume` | Resume paused song |
| `/music queue` | Show the queue |
| `/music nowplaying` | Show current song |
| `/music volume` | Set volume (1-100) |

### 🤖 AI (Powered by Claude)
| Command | Description |
|---------|-------------|
| `/ask <question>` | Ask Claude anything via slash command |
| `@mention` | Mention the bot anywhere to chat |
| AI Channel | Set a channel where bot auto-replies to all messages |

### ⚙️ Utility
| Command | Description |
|---------|-------------|
| `/info server` | Server info |
| `/info user` | User info |
| `/info ping` | Bot latency |
| `/help` | Show all commands |

---

## 🚀 Setup

### Step 1 — Create a Discord Bot
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Add Bot**
4. Copy the **Token**
5. Under **Privileged Gateway Intents**, enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator`
7. Copy the generated URL and invite the bot to your server

### Step 2 — Get your Client ID
- In the Developer Portal → **General Information** → copy **Application ID**

### Step 3 — Configure the bot
```bash
# Copy the example env file
cp .env.example .env
```

Fill in your `.env`:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_CHANNEL_ID=optional_channel_id_for_auto_ai_replies
```

### Step 4 — Install dependencies
```bash
npm install
```

### Step 5 — Run the bot
```bash
node index.js
```

You should see:
```
🤖 YourBot#0000 is online!
📊 Serving 1 server(s)
✅ Registered 8 slash commands globally.
```

---

## 🌐 Hosting (Free Options)

### Option A — Railway (Recommended, free tier)
1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add your environment variables in Settings
5. Done — bot runs 24/7

### Option B — Replit (Easy)
1. Create a new Replit → upload files
2. Add secrets (env vars) in the Secrets tab
3. Use [UptimeRobot](https://uptimerobot.com) to keep it alive

---

## 📝 Notes
- Music requires the bot to be in the same voice channel as you
- Moderation commands require the appropriate Discord permissions
- Warn data resets when the bot restarts (use a database for persistence)
- AI_CHANNEL_ID is optional — leave blank to disable auto-replies

---

*Built by **The Creative Studio** · 
