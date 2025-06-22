import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, browserLocalPersistence, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDyOEewLMmEHxzfikKpOn2_ADgf7x7TSKY',
  authDomain: 'fitmap-84de1.firebaseapp.com',
  databaseURL: 'https://fitmap-84de1-default-rtdb.firebaseio.com',
  projectId: 'fitmap-84de1',
  storageBucket: 'fitmap-84de1.firebasestorage.app',
  messagingSenderId: '1065715922957',
  appId: '1:1065715922957:web:85574ecc095f00d2d67d44',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider(app);

export { auth, provider };
