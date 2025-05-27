# Voice AI Callback Agent

A minimalist and secure Voice AI Callback experience built with **Next.js**, **Firebase**, and **Twilio**. This app allows users to request a callback, engage in a natural voice conversation powered by AI, and get redirected to a secure dashboard with a summary — all without creating an account.

---

## 🔧 Features

- 🔊 **Voice AI Calls** – Talk to users through Twilio voice calls using an AI agent.
- 📋 **Callback Request Form** – Collects name, email, and call reason.
- 🔐 **Passwordless Email Sign-In** – Secure login via Firebase email magic link.
- 📊 **Protected Dashboard** – View user-submitted info after successful auth.
- ☁️ **Firebase Backend** – Stores call request data and handles auth securely.
- 💨 **Minimalist Design** – Built with Tailwind CSS (optional, toggleable).

---

## 📁 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Functions)
- **Voice Service**: [Twilio Programmable Voice](https://www.twilio.com/voice)
- **Deployment**: Vercel + Firebase Functions

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/voice-ai-callback-agent.git
cd voice-ai-callback-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

- Initialize Firebase in the `/functions` folder:
  ```bash
  firebase init functions
  ```
- Add secrets securely:
  ```bash
  firebase functions:secrets:set TWILIO_SID
  firebase functions:secrets:set TWILIO_AUTH_TOKEN
  firebase functions:secrets:set TWILIO_PHONE_NUMBER
  ```

- In `functions/index.js`, access secrets like:
  ```js
  const twilioSid = param('TWILIO_SID').value();
  ```

### 4. Configure Firebase Auth (Email Link)

- Enable **Email Link (passwordless sign-in)** in the Firebase Console under Authentication > Sign-in methods.
- Add your app's domain to the list of authorized domains.

---

## 🧪 Local Development

- Run the frontend locally:
  ```bash
  npm run dev
  ```

---

## 🔒 Environment Variables

- Firebase handles secrets securely via the CLI.
- For frontend `.env.local`:
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  ```

---

- [x] Callback form UI
- [x] Twilio integration
- [x] Firebase Auth with magic link
- [x] Protected dashboard
- [ ] Add call transcript to dashboard
- [ ] Voice AI agent personality fine-tuning

---

## 👤 Author

Mahyar Erfanian  
[LinkedIn](https://www.linkedin.com/in/mahyar-erfanian-67968279/) • [GitHub](https://github.com/Mahyar-98)

---
