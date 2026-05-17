import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBmlHQImhipkoTuQYstmtY_JEE-49n8-E8",
  authDomain: "siae-82cd5.firebaseapp.com",
  projectId: "siae-82cd5",
  storageBucket: "siae-82cd5.firebasestorage.app",
  messagingSenderId: "193746746807",
  appId: "1:193746746807:web:346eb5e6fdf14dbcb9bc32",
  measurementId: "G-LSZ44QDGP3"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const auth = getAuth();
