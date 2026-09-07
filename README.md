# LiveQuiz Arena — Live Event Stage Quiz

A real-time Kahoot/Mentimeter-style quiz application built for live audiences and stage projectors.

## Live Public URLs
- **Landing Page:** [https://livequiz-978ee.web.app](https://livequiz-978ee.web.app)
- **Host Console:** [https://livequiz-978ee.web.app/#/host](https://livequiz-978ee.web.app/#/host)
- **Player Join:** [https://livequiz-978ee.web.app/#/play](https://livequiz-978ee.web.app/#/play)

---

## Features
1. **Interactive Host Question Creator**: Create, edit, and configure custom multiple-choice questions, correct answers, and timers right in the browser.
2. **Big-Screen Stage Lobby**: High-resolution client-side SVG QR code + 5-character room code. Shows live-updating joined player count and player roster.
3. **Player Join with Name + Roll No**: Takes student Name and Roll No, generates an anonymous Firebase Auth identity, and prevents duplicate roll number entries.
4. **Synchronous Countdowns**: Anchored to Firestore server timestamps, ensuring all mobile devices count down and finish at the exact same instant regardless of local phone clock skew.
5. **Robust Concurrency Handling**:
   - Immediate client-side answer button lockout on tap to prevent double submissions.
   - Throttled host listeners (300-400ms) to ensure smooth 60fps rendering during answer bursts.
   - Automatic reconnect resilience via `localStorage` session persistence.
   - Late joiner protection: players joining mid-quiz are held until the next question.
6. **Live Analytics & Leaderboard**:
   - Host sees response count and real-time answer distribution breakdown (A, B, C, D) with correct answer highlight.
   - Ranked leaderboard with medals, score deltas, and celebration confetti.

---

## Local Development & Scripts

### Run Development Server
```bash
npm run dev
```

### Build Production Bundle
```bash
npm run build
```

### Deploy to Firebase Hosting & Rules
```bash
firebase deploy
```

### Programmatic Question Seeding (CLI)
Edit `scripts/questions.json` and run:
```bash
node scripts/seedQuestions.js [ROOM_CODE]
```

### Concurrency Load Simulation
Simulate 30 concurrent players joining and answering simultaneously:
```bash
node scripts/simulatePlayers.js [ROOM_CODE]
```
