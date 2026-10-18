import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW94mPtqcjavEDQ-7eRFacNWqvOV1q0ls",
  authDomain: "b2b-dashboard-fcdcf.firebaseapp.com",
  projectId: "b2b-dashboard-fcdcf",
  storageBucket: "b2b-dashboard-fcdcf.firebasestorage.app",
  messagingSenderId: "373905093076",
  appId: "1:373905093076:web:ab370e748af61ba08c2641"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

  ]
};
