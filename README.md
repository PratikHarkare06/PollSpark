# ⚡ PollSpark


📸 Application Preview
<img width="1470" height="836" alt="Screenshot 2026-03-11 at 5 33 57 PM" src="https://github.com/user-attachments/assets/e2a95004-e6db-4e53-aa9e-916ea6369090" />


**PollSpark** is a high-performance, socially-driven real-time polling platform. Built with a modern tech stack, it allows users to create, participate in, and analyze polls with a premium, app-like experience.

---

## ✨ Key Features

### 🗳️ Advanced Poll System
- **Dynamic Options**: Support for 2 to 6 options per poll.
- **Image Integration**: Add visual context to poll options.
- **Privacy Levels**: Create **Public** polls for the global feed or **Unlisted** polls for direct-link-only sharing.
- **Expiration Control**: Set polls to expire after 1h, 6h, 24h, 7 days, or never.

### 📊 Real-Time Analytics
- **Live Updates**: Vote percentages update instantly as users participate.
- **Interactive Charts**: Creator-exclusive **Pie Charts** (via Recharts) for visual data breakdown.
- **Data Export**: Export poll results to **CSV** for external analysis.

### 💬 Social Engagement
- **Engagement Loop**: Like system and real-time threaded comments.
- **Instant Notifications**: Stay updated when users interact with your polls.
- **Voter Transparency**: Exclusive "Creator View" to see exactly who voted for which option.

### 📱 Premium UX/UI
- **Glassmorphism Design**: Modern, sleek interface with smooth micro-animations.
- **Dark/Light Mode**: Full theme support that mirrors user system preferences.
- **PWA Ready**: Install PollSpark as a home screen app for an offline-ready, mobile-first experience.
- **Multi-Auth**: Secure login via Google, Email, or traditional password.

### 🔗 Sharing & Embedding
- **Universal Share**: Native system share sheet integration.
- **iFrame Embeds**: Generate embed codes to put your polls on any website.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Styled Components](https://styled-components.com/)
- **State/Backend**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, Hosting)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/PratikHarkare06/PollSpark.git
cd poll-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Firebase configurations:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally
```bash
npm start
```
The app will be available at `http://localhost:3000`.

---

## 📦 Deployment

This project is configured for **Firebase Hosting**.

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open an issue for bugs.
- Submit pull requests for feature enhancements.
- Share feedback on the UI/UX.

---

## 📄 License

This project is licensed under the MIT License.

---

**Created with ❤️ by [Pratik Harkare](https://github.com/PratikHarkare06)**
