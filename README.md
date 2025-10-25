# Full Dashboard (React + Vite + Firebase)

A responsive, role-aware admin dashboard built with React (Vite) and Firebase (Auth, Firestore, Storage). It ships with authentication, protected routes, a real-time user profile with avatar upload, responsive layout/navigation, and ready-to-apply Firebase security rules and Storage CORS.

## Features

- Authentication (Email/Password)
  - Login and Register built with Formik + Yup (client-side validation, friendly error messages)
  - Prevent access to Login/Register when already authenticated
  - Protected routes with a loading guard to avoid unwanted redirects on refresh
- User Profile
  - Default avatar on registration (via ui-avatars) based on username
  - Real-time profile using Firestore onSnapshot
  - Avatar upload to Firebase Storage with a unique filename, instant preview, and automatic swap to the final download URL
  - Firestore stores both `avatarUrl` and `avatarPath`; old avatar files are deleted automatically on update
  - Image validation (image/\* only, ~3MB size limit)
- Role-based UI/permissions
  - Regular users can edit username + avatar
  - Admins can change avatar only (username field disabled in UI)
- Responsive layout
  - Navbar shows signed-in username, mobile menu included
  - Sidebar is responsive (overlay on small screens, static on larger)
  - Tables (Users/Products/Orders) hide less-important columns on small screens and allow horizontal scroll when needed
- Security & CORS
  - `firestore.rules` and `storage.rules` included in the repo
  - `cors.json` included to enable Storage uploads from localhost without CORS errors

## Tech Stack

- React 18 + Vite
- React Router
- Tailwind CSS
- Firebase: Authentication, Cloud Firestore, Storage
- react-firebase-hooks (useAuthState)
- Formik + Yup
- (Optional) react-chartjs-2

## Project Structure

```
src/
  App.jsx
  main.jsx
  firebase.js           # Firebase init (Auth, Firestore, Storage)
  components/           # Navbar, Sidebar, Card, Chart, ...
  pages/                # Login, Register, DashboardHome, Profile, Products, Orders, Users
  context/              # AuthContext + useAuth hook
  services/             # Cloudinary, Firestore helpers, etc.
public/
```

## Getting Started

1. Prerequisites

- Node.js 18+
- A Firebase project with Authentication (Email/Password), Firestore, and Storage enabled

2. Configure Firebase

- Update `src/firebase.js` with your Firebase config (apiKey, authDomain, projectId, storageBucket, etc.) from the Firebase Console.

3. Install & Run

```powershell
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Firebase Security Rules

Files are provided in the repo root: `firestore.rules` and `storage.rules`.

Option A — Firebase CLI

```powershell
# login once
firebase login

# deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Option B — Firebase Console

- Firestore → Rules → paste `firestore.rules` → Publish
- Storage → Rules → paste `storage.rules` → Publish

Notes

- Firestore rules: public read for `users/{uid}`, writes (create/update) only by the owner (`auth.uid == doc id`).
- Storage rules: public read for `avatars/{uid}/**` so avatars are viewable; writes only by the owner.

## CORS for Firebase Storage (Uploads from localhost)

If you see a CORS error when uploading avatars from localhost, apply the included `cors.json` to your Storage bucket.

Option A — gsutil (Google Cloud SDK)

```powershell
# Install/activate Google Cloud SDK first, then run:
# Replace <YOUR_BUCKET> with your Firebase Storage bucket (e.g., my-app.appspot.com)

gsutil cors set cors.json gs://<YOUR_BUCKET>
```

Option B — Google Cloud Console

- Google Cloud Console → Storage → Browser → select your bucket
- Edit CORS configuration → paste the content of `cors.json` → Save

After applying CORS, retry the avatar upload from the Profile page.

## Known Behaviors & Troubleshooting

- Prevent redirect to Login on refresh: Protected routes wait for Firebase auth `loading` before deciding; verify network and config.
- Avatar not updating after upload: We use unique filenames + Firestore onSnapshot + old file cleanup. If needed, hard refresh or clear cache.
- Role restrictions: Admins can change avatar only; regular users can change username + avatar.

## Scripts

```powershell
npm run dev      # start development server
npm run build    # production build
npm run preview  # preview the production build locally
```

## Notes

This project is provided for learning/demo purposes. Add a license if you plan to open-source or distribute it.
