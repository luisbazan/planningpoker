import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 