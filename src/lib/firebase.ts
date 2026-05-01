import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnJvQ_3OKk37Hr-4K0S2U-wKuIaTDdyew",
  authDomain: "easyprint-495009.firebaseapp.com",
  projectId: "easyprint-495009",
  storageBucket: "easyprint-495009.firebasestorage.app",
  messagingSenderId: "694336331900",
  appId: "1:694336331900:web:51f4dac396d558047e29f9",
  measurementId: "G-2B4NEEGRWY",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
