# 🎓 StudyPlay PRO — Smart YouTube Playlist Study & Target Pacing Hub

Ek modern, feature-packed dark-themed web application jo YouTube playlists se systematically padhne ke liye banayi gayi hai. Isme kisi backend ya server ki zaroorat nahi hai — sab kuch browser ke high-performance **LocalStorage** me store hota hai.

---

## ⚡ Main Features

1. **Automatic YouTube Playlist Fetcher**:
   - Playlist ka URL ya ID paste karte hi automatically detect karta hai.
   - Total videos count, total duration (exact hours/minutes), thumbnail, creator info calculate karta hai.
   - Dual-engine support: Free YouTube Data API v3 key support + automatic public fallback mirror + pre-loaded curated demo playlists.

2. **30-Day (or Custom) Target Pacing Calculator**:
   - Apna completion target set karein (jaise 30 days, 15 days, 45 days ya custom date).
   - Website automatically calculate karti hai:
     - **Daily Videos Required**: Daily kitni videos dekhni hai (e.g. `~2 videos/day`).
     - **Daily Study Time**: Daily kitna time padhna padega (e.g. `45 mins/day`).
     - **Pace Status**: *On Track 🟢*, *1 Day Ahead 🚀*, ya *2 Days Behind ⚠️*.

3. **Playback Speed Time Saver Calculator**:
   - 1.0x, 1.25x, 1.5x, 1.75x, aur 2.0x speeds par total kitna time lagega aur kitne hours/minutes save honge, sab ek click me dikhata hai.

4. **Daily Habit & Streak Tracker**:
   - 🔥 Daily Streak Counter (e.g. 5 Days Streak).
   - Today's study time in minutes and completed videos.
   - 7-Day interactive study activity bar chart.
   - Video complete hone par celebratory confetti animations!

5. **Multiple Playlists Support**:
   - Unlimited playlists add aur manage karein (Coding, Web Dev, DSA, College Exams, Python, AI, etc.).
   - Category filtering & instant search bar.

6. **Distraction-Free In-App YouTube Player**:
   - YouTube ki recommendations aur ads se bachne ke liye clean in-app player.
   - Next / Previous lecture buttons.
   - Har lecture ke liye **Personal Notes & Timestamps editor** (automatically saves to LocalStorage).

7. **Clean LocalStorage Management**:
   - Storage usage meter (KB used aur % gauge).
   - **Export Backup (JSON)**: Saara data ek click me download karein.
   - **Import Backup (JSON)**: Kisi bhi computer/browser me restore karein.
   - **Clear LocalStorage**: Safe confirmation modal ke saath data reset karne ka option.

8. **Aesthetic Dark Theme**:
   - Ultra-modern deep slate & obsidian styling `#090D16` with neon cyan, emerald aur indigo accents.

---

## 🚀 How to Run the Website

Terminal me project folder me ye command chalayein:

```bash
# Development Server start karne ke liye:
npm run dev
```

Browser me URL open karein:
```
http://localhost:5173
```

Production build banane ke liye:
```bash
npm run build
```

---

## 🔑 YouTube Data API v3 (Optional, Free)

Website me built-in demo courses aur public fetchers pehle se maujood hain. Lekin agar aap 100% fast aur reliable fetching chahte hain:
1. Google Cloud Console par jayein (`console.cloud.google.com`).
2. "YouTube Data API v3" enable karein aur ek API Key banayein (Free quota: 10,000 units/day).
3. App ke top-right **Settings (⚙️)** me jakar API key paste karke save karein. Key aapke browser ke LocalStorage me privately save rehti hai.
