// client/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Objek konfigurasi yang Anda dapatkan dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC7q2UdZ0SintSiJf0xiGJX16LVuQgo8JE",
  authDomain: "pusat-kemasan.firebaseapp.com",
  projectId: "pusat-kemasan",
  storageBucket: "pusat-kemasan.firebasestorage.app",
  messagingSenderId: "824829619583",
  appId: "1:824829619583:web:338470867b5683cbb8fe4a"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor modul 'auth'
export const auth = getAuth(app);
