# Life Coach App 🌟

A privacy-first personal life coach application that combines habit tracking, mood logging, journaling, and a curated content feed — all with encryption and zero data collection.

## ✨ Features

- **Habit Tracker** — Create habits, track streaks, visualize completion rates
- **Mood Logger** — Daily mood tracking with trend analysis and charts
- **Private Journal** — Encrypted note-taking with full-text search
- **Curated Feed** — Algorithm-free content from creators you choose
- **Time Limits** — Built-in break reminders to prevent doom scrolling
- **Privacy First** — All data encrypted locally, nothing sent to servers by default
- **Export/Import** — Backup your data as JSON anytime
- **Open Source** — MIT licensed, fully transparent code

## 🔐 Privacy Guarantee

- ✅ Data encrypted on your device using TweetNaCl.js
- ✅ No cloud sync (optional in v2)
- ✅ No user tracking or analytics
- ✅ No ads, no algorithms, no data selling
- ✅ Full control over your information

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/life-coach-app.git
cd life-coach-app
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # React components (Dashboard, Tracker, etc.)
├── hooks/          # Custom React hooks (encryption, storage, etc.)
├── utils/          # Utility functions (encryption, date helpers)
├── store/          # Zustand state management
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite** — Fast bundler
- **Tailwind CSS** — Utility-first styling
- **Zustand** — State management
- **TweetNaCl.js** — Client-side encryption
- **IndexedDB** — Local persistent storage
- **Recharts** — Data visualization
- **Lucide React** — Icons

## 📚 Development Roadmap

### Phase 1: Core Features ✅ COMPLETE
- [x] Encryption layer & local storage
- [x] Habit tracker UI
- [x] Mood logger with charts
- [x] Journal editor
- [x] Dashboard overview
- [x] Settings & export/import

### Phase 2: Content Feed
- [ ] Manual feed subscription
- [ ] Time limit warnings
- [ ] Break reminders

### Phase 3: Polish & Deploy
- [ ] UI/UX refinement
- [ ] Testing
- [ ] Documentation
- [ ] Deploy to Vercel

### Phase 4: v2 Features (Future)
- [ ] Optional cloud sync (encrypted)
- [ ] On-device AI insights
- [ ] Mobile app (React Native)
- [ ] Community features

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with privacy and transparency in mind
- Inspired by the need for better mental health tools
- Thanks to all open-source contributors

## 📞 Support

Have questions or found a bug? Open an issue on GitHub!

---

**Remember:** Your data is yours. Always.
