# CivicConnect 🏙️

**CivicConnect** is a modern, role-based platform designed to bridge the gap between citizens and municipal authorities. It enables residents to easily report civic issues—such as potholes, water leaks, broken streetlights, garbage dumps, and drainage blockages—while fostering stronger community engagement and providing municipal officials with the tools they need to efficiently resolve public infrastructure problems.

---

## ✨ Features

### 👤 Role-Based Access Control (RBAC)
CivicConnect enforces strict security and capabilities based on immutable user roles (assigned securely via the backend/database):

- **Visitors (Not Logged In):** Can view public issues, browse the community feed, explore the map, and view public events.
- **Citizens:** Can report issues (with photos & location), participate in discussions, support/upvote existing complaints, register for events, and edit/delete their own reports before they are assigned.
- **Municipal Officials:** Access the dedicated *Civic Workspace* to view complaints assigned to their department, update issue statuses (e.g., *In Progress*, *Resolved*), assign field workers, upload resolution evidence, and post official municipal announcements.
- **Community Moderators:** Can moderate discussions, remove inappropriate content, verify reported issues, and maintain a healthy community environment.
- **Administrators:** Full system access to manage users, assign roles, manage issue categories and departments, view analytics, and control system-wide settings.

### 🚀 Core Modules
- **Issue Reporting & Live Map:** Citizens can drop pins on a map, attach images, and submit detailed reports.
- **Community Feed:** A dedicated space for municipal announcements, community notices, and citizen discussions.
- **Smart Categorization & AI Image Verification:** Integrates with AI (Gemini 2.5 Flash) to auto-verify that uploaded images represent valid civic issues (rejecting selfies, memes, etc.), auto-categorize issues, and optimize text descriptions.
- **Smart Priority Ranking:** The system automatically prioritizes complaints based on severity, citizen endorsements (upvotes), location density, and urgency to help officials tackle the most critical issues first.
- **Targeted Emergency Alerts:** Admins and officials can broadcast emergency alerts strictly to citizens and moderators. Individual citizens can persistently dismiss read alerts without affecting other users on the same device.
- **Secure Authentication:** Supports Email/Password and Google OAuth. *Note: Google OAuth intelligently syncs with pre-provisioned roles to prevent role escalation or loss.*
- **Mobile-Responsive UI:** Carefully designed layouts ensuring full compatibility, touch-friendly interactions, and visible action buttons across all mobile devices and web browsers.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Bootstrapped with Vite)
- TypeScript
- Tailwind CSS (with Glassmorphism UI)
- Firebase Auth & Firestore

**Backend:**
- Node.js & Express
- TypeScript
- Firebase Admin SDK (for secure backend operations like role assignment)
- Cloudinary (for scalable, fast image/avatar uploads via the `/api/upload` endpoint)
- Google Gemini API (for AI validation & processing)

---

## ⚙️ Getting Started & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- A [Firebase](https://firebase.google.com/) Project (with Firestore and Authentication enabled)
- A [Cloudinary](https://cloudinary.com/) Account (for image uploads)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/ritika-vishwa/civic-connect.git
cd civic-connect
```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Retrieve your **Firebase Service Account Key** (`serviceAccountKey.json`) from your Firebase Console (Project Settings > Service Accounts) and place it in the `backend/` directory.
3. Create a `.env` file in the `backend/` directory based on `.env.example`:
   ```env
   PORT=3001
   FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Gemini
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend runs on `http://localhost:3001`.*

### 4. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env.local` file in the `frontend/` directory with your configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=http://localhost:3001
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:5173`.*

---

## 🔒 Security & Architecture Notes

- **Role Immutability:** User roles are stored in Firestore (`users/{uid}`). The frontend UI cannot override roles during login or signup. Roles can only be escalated by an Administrator via the protected backend endpoint (`/api/auth/set-role`).
- **Google Sign-In Sync:** If an Administrator provisions an account via email, and the user later signs in with Google using that same email, the system will accurately fetch and inherit their pre-provisioned role rather than overwriting them as a standard citizen.
- **Firestore Security Rules:** The database rules explicitly prevent users from modifying the `role` field on their own user documents.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
