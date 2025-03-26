// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA0ZtbeS8Xn2FslGmAfsb1wr7cDe92D-RI",
    authDomain: "posapp-3f335.firebaseapp.com",
    projectId: "posapp-3f335",
    storageBucket: "posapp-3f335.firebasestorage.app",
    messagingSenderId: "422196001185",
    appId: "1:422196001185:web:38fa43997ab1492bd7f3e0",
    measurementId: "G-H2X5ZH8VYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);