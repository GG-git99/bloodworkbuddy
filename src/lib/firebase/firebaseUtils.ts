import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Auth functions
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName: name,
      createdAt: Timestamp.now(),
    });
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Bloodwork data functions
export const saveBloodworkResult = async (userId: string, resultData: any) => {
  try {
    // Add metadata for better organization
    const enhancedData = {
      ...resultData,
      userId,
      createdAt: new Date().toISOString(),
      // Generate a display date (just the date part)
      displayDate: new Date().toISOString().split('T')[0]
    };
    
    const docRef = await addDoc(collection(db, 'bloodworkResults'), enhancedData);
    return { id: docRef.id, ...enhancedData };
  } catch (error: any) {
    console.error('Error saving bloodwork result:', error);
    throw new Error(`Failed to save bloodwork result: ${error.message}`);
  }
};

export const getUserBloodworkHistory = async (userId: string) => {
  try {
    // Simplified query that doesn't require a composite index
    const q = query(
      collection(db, 'bloodworkResults'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Sort results in memory (client-side) to avoid needing a Firestore index
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt in descending order
    return results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error: any) {
    console.error('Error getting bloodwork history:', error);
    
    // Check if error is related to missing index
    if (error.message && error.message.includes('index')) {
      throw new Error("Database query issue. We're working on fixing this. Please try again later.");
    }
    
    throw new Error(`Failed to get bloodwork history: ${error.message}`);
  }
};

export const getBloodworkResult = async (resultId: string) => {
  try {
    const docRef = doc(db, 'bloodworkResults', resultId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Result not found');
    }
  } catch (error: any) {
    console.error('Error getting bloodwork result:', error);
    throw new Error(`Failed to get bloodwork result: ${error.message}`);
  }
};

export const getMostRecentBloodworkResult = async (userId: string) => {
  try {
    // Simplified query that doesn't require a composite index
    const q = query(
      collection(db, 'bloodworkResults'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Sort results in memory and get the most recent one
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return results[0]; // Return the most recent result
  } catch (error: any) {
    console.error('Error getting most recent result:', error);
    throw new Error(`Failed to get most recent result: ${error.message}`);
  }
};

export const updateBloodworkResult = async (resultId: string, updates: any) => {
  try {
    const docRef = doc(db, 'bloodworkResults', resultId);
    await updateDoc(docRef, updates);
    return true;
  } catch (error: any) {
    throw new Error(`Failed to update bloodwork result: ${error.message}`);
  }
};

export const deleteBloodworkResult = async (resultId: string) => {
  try {
    await deleteDoc(doc(db, 'bloodworkResults', resultId));
    return true;
  } catch (error: any) {
    console.error('Error deleting bloodwork result:', error);
    throw new Error(`Failed to delete result: ${error.message}`);
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const uploadBloodworkImage = async (userId: string, file: File) => {
  const storageRef = ref(storage, `bloodworks/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const saveBloodworkData = async (userId: string, resultData: any) => {
  // This can be an alias to saveBloodworkResult
  return saveBloodworkResult(userId, resultData);
};
