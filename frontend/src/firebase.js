import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeZwCMeu1QHS2F7yYD5nxBUk3FbbMO5JI",
  authDomain: "legalai-9fa13.firebaseapp.com",
  projectId: "legalai-9fa13",
  appId: "1:494775473242:web:31418d2b963dac7cffb463"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();