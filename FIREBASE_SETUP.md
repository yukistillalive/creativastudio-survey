# Firebase Setup Guide

Follow these steps to set up Firebase for tracking participant IDs.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `creativastudio-survey` (or any name you prefer)
4. Disable Google Analytics (not needed for this) or keep it enabled
5. Click "Create project"

## Step 2: Enable Realtime Database

1. In your Firebase project, go to **Build** → **Realtime Database**
2. Click "Create Database"
3. Choose a location (e.g., `us-central1`)
4. Start in **Test mode** for now (we'll secure it later)
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web icon** (`</>`) to add a web app
4. Register app name: `creativastudio-survey-web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. **Copy the firebaseConfig object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx"
};
```

## Step 4: Update Your Code

1. Open `src/utils/firebase.js`
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_ACTUAL_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Set Up Security Rules (Important!)

1. Go to **Realtime Database** → **Rules** tab
2. Replace the default rules with:

```json
{
  "rules": {
    "participants": {
      "$participantId": {
        ".write": "!data.exists()",
        ".read": true
      }
    }
  }
}
```

This allows:
- ✅ Anyone can read participant data
- ✅ Anyone can write a NEW participant ID (only once)
- ❌ Cannot overwrite existing participant IDs

3. Click **Publish**

## Step 6: Test It

1. Run `npm run dev`
2. Complete the survey questions
3. You should get a participant ID
4. Check Firebase Console → Realtime Database → Data tab
5. You should see: `participants → [ID] → { group, timestamp, etc. }`

## What This Does

- ✅ Stores every participant ID in Firebase
- ✅ Prevents duplicate IDs (checks before generating)
- ✅ Tracks which group (A or B) each participant was assigned
- ✅ Records timestamp and metadata
- ✅ Can view all participants in Firebase Console

## Viewing Your Data

Go to Firebase Console → Realtime Database → Data tab to see:

```
participants
├── M3K7H3
│   ├── id: "M3K7H3"
│   ├── group: "A"
│   ├── timestamp: 1737123456789
│   ├── date: "2026-01-17T12:34:56.789Z"
│   └── userAgent: "Mozilla/5.0..."
├── M3K8P2
│   ├── id: "M3K8P2"
│   ├── group: "B"
│   └── ...
```

## Export Data (for Analysis)

1. Go to Realtime Database → Data tab
2. Click the **⋮** menu → **Export JSON**
3. You can then convert to CSV or analyze in spreadsheets

## Troubleshooting

**Error: "Firebase not initialized"**
- Make sure you updated `firebase.js` with your actual config

**Error: "Permission denied"**
- Check that your database rules are set correctly
- Make sure you published the rules

**IDs not showing in Firebase**
- Open browser console (F12) and check for errors
- Verify your `databaseURL` is correct

## Need Help?

Check Firebase Console for errors and make sure:
1. Realtime Database is enabled
2. Security rules are published
3. Config in `firebase.js` matches your project
