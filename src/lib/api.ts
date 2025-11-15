import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName] || process.env[varName]?.includes("your-")
);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing or incomplete Firebase environment variables: ${missingVars.join(
      ", "
    )}\n` +
      `Please update your .env.local file with your Firebase project credentials.\n` +
      `You can find these in Firebase Console: Project Settings > General > Your apps`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
