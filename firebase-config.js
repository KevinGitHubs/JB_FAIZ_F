import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvxioFxBC1BTsjEskQNyhnU2rwHOwh5to",
  authDomain: "faizf-storage.firebaseapp.com",
  projectId: "faizf-storage",
  storageBucket: "faizf-storage.firebasestorage.app",
  messagingSenderId: "459733813360",
  appId: "1:459733813360:web:7fc1b761ca0f60e6730cb5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, ref, uploadBytes, getDownloadURL };
