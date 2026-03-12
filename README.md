# CampusCashMap

![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20%7C%20Mobile-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge)

🔒 **Login-free Progressive Web App for Student Budget Management**

🌐 **Live Demo:** [campuscashmap.web.app](https://campuscashmap.web.app)

---

**Mobile-first, login-free web app for students to plan monthly budgets and track expenses.**

CampusCashMap is a Progressive Web App (PWA) designed to help students manage their finances without the need for accounts or logins. It works offline, stores data locally on your device, and supports Ethiopian Calendar dates and Currency (ETB).

## ✨ Features

- **💰 Budget Planning:** Set a specific budget for each month.
- **📝 Expense Tracking:** Add expense records with title, amount, category, date, and optional notes.
- **📊 Real-time Analytics:** See total spent, remaining amount, and over-budget amounts instantly.
- **🔄 Visual Usage Ring:** A circular progress indicator shows monthly budget utilization.
- **📅 Month Switching:** Switch between months seamlessly; each month's data is kept separate.
- **📈 Category Breakdown:** Visual bar chart for spending analysis by category (Food, Transport, Data, etc.).
- **🇪🇹 Localized:** 
  - Currency displayed in **Ethiopian Birr (ETB)**.
  - Dates displayed in **Ethiopian Calendar** alongside Gregorian dates.
- **🌓 Theme Toggle:** Animated BB-8 themed dark/light mode switcher.
- **📲 PWA & Offline:** Installable on mobile/desktop with offline support via Service Workers.
- **🔒 Privacy First:** No backend, no login. Data persists only in your browser's `localStorage`.
- **⚠️ Safety Controls:** One-click reset for the current month with confirmation dialog.
- **💬 Feedback:** In-app action banners for save/add/remove/validation actions.

## 🚀 Quick Start

### Use Online (No Installation Required)
1. Visit **[campuscashmap.web.app](https://campuscashmap.web.app)** in your browser.
2. Start tracking your budget immediately — no sign-up needed!

### Install as an App (PWA)
For the best experience, install CampusCashMap to your device:

| Platform | Instructions |
|----------|-------------|
| **Android / Chrome / Edge** | Tap the "Install App" button in the app header, or use browser menu → "Install CampusCashMap" |
| **iOS / Safari** | Tap **Share** → **Add to Home Screen** |
| **Desktop (Chrome/Edge)** | Look for the install icon in the address bar, or use menu → "Install CampusCashMap" |

✅ Once installed, the app works **offline** and launches like a native app!

## 🛠 Tech Stack

- **Frontend:** React 19
- **Build Tool:** Vite 7
- **Styling:** Plain CSS (Custom mobile-first UI with CSS Variables)
- **PWA:** `vite-plugin-pwa` (Service Worker + Web App Manifest)
- **Hosting:** Firebase Hosting
- **Utilities:** `ethiopian-date` for calendar conversion
- **Linting:** ESLint (Flat config)

## 💻 Run Locally (Development)

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1.  **Clone the repository** (or download the source files).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  **Open your browser:**
    Navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

```bash
npm run build
