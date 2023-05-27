import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
import {getAuth} from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
 
  apiKey: "AIzaSyASPJmwVoCM_w8aApr6zQalBqHS8D-NqJM",
  authDomain: "hotel-app-admin.firebaseapp.com",
  databaseURL: "https://hotel-app-admin-default-rtdb.firebaseio.com",
  projectId: "hotel-app-admin",
  storageBucket: "hotel-app-admin.appspot.com",
  messagingSenderId: "171112052271",
  appId: "1:171112052271:web:37fcec78c04a5ce95938da"
  };
  
  const app = initializeApp(firebaseConfig);

  // Get the Firestore instance
  const db = getFirestore(app);
  
  // Get the Auth instance
  const auth = getAuth(app);
  const storage = getStorage(app);

  
  export {  auth, db, storage };