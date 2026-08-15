import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PEGA AQUÍ TU firebaseConfig REAL (este es de ejemplo)
const firebaseConfig = {
    // Configuración de Firebase para soporte de autenticación, gestión de clubes y equipos, y superadministrador.
    apiKey: "AIzaSyDf95t7VelZoS1GGPReM0H_soCjgDVmJ9M",
    authDomain: "app-33232.firebaseapp.com",
    projectId: "app-33232",
    storageBucket: "app-33232.appspot.com", // corregido domain para ficheros
    messagingSenderId: "789181538020",
    appId: "1:789181538020:web:18160250b88ee524a0d6f1",
    measurementId: "G-WSFYQ5M2VD"
};

// Arrancamos el motor de Firebase y exportamos la base de datos
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();