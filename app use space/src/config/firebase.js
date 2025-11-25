import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCZk-spnLX7dZAq7Vo81clMoj5mdYdWr6g",
  authDomain: "airbnb-comercial-full.firebaseapp.com",
  projectId: "airbnb-comercial-full",
  storageBucket: "airbnb-comercial-full.appspot.com",
  messagingSenderId: "709976108465",
  appId: "1:709976108465:web:c04655b27b8a20faa52190"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); 

let auth;

if (Platform.OS === 'web') {
    auth = getAuth(app); 
} else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

export { app, auth, db, storage };
