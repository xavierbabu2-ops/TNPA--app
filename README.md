# TNPA² Web Platform & TV Live Streaming Service

Welcome to the **Tamil Nadu Painters Association (TNPA²)** Official Web Platform and TV Broadcast Channel system.

---

## 📺 Live Broadcast Streaming Setup (RTMP & HLS)

The TNPA² TV Channel component (`TnpaTvChannel`) supports real-time live video streaming, HLS playback (`.m3u8`), YouTube embeds, and MP4/WEBM video recordings.

### Optional Environment Variables for Live Streaming

To connect a live broadcast server or external media stream ingest (e.g. OBS Studio, vMix, AWS MediaLive, Cloudflare Stream, or Nginx-RTMP), configure the following optional environment variables in your server environment:

```env
# RTMP Ingest Endpoint for OBS Studio / vMix / Live Encoders
RTMP_INGEST_URL="rtmp://live.tnpa2tv.in/live"

# Stream Authentication Key for Encoders
RTMP_STREAM_KEY="tnpa2_live_secret_key_2026"

# Live HLS Playback URL (.m3u8) rendered in TnpaVideoPlayer
LIVE_HLS_PLAYBACK_URL="https://stream.tnpa2tv.in/live/master.m3u8"
```

### Video Stream URL Handling & Fault Tolerance

The video player (`TnpaVideoPlayer`) and stream controls (`AdminLiveBroadcastControl`) include built-in safety mechanisms:

1. **URL Existence Check**: The video component validates that a stream URL exists before attempting to initialize `hls.js` or mounting HTML5 `<video>` tags.
2. **Fallback Standby Mode**: If no video URL or HLS link is provided (`undefined` or `""`), the player cleanly renders a branded **TNPA² TV Standby Screen** rather than crashing or throwing unhandled JavaScript runtime exceptions.
3. **Health Verification Endpoint**: Super Admins can verify live server connectivity at `/api/stream/health` before setting streams live.

---

## 🛠️ Tech Stack & Development

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, HLS.js
- **Backend**: Node.js, Express, Google GenAI SDK (Gemini Search & Studio)
- **Deployment**: Compatible with Cloud Run, Vercel, and Docker
