// lib/firestore.ts
import { db } from './firebase'; // Your initialized Firestore instance
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Define a type for our user profiles
interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  createdAt: any; // Using 'any' for serverTimestamp flexibility
}

// Function to create or update a user's profile in Firestore
// This is useful to call right after a user signs up.
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  return setDoc(userRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
};

// Function to save an analysis result to a user's document
export const saveAnalysisResult = async (uid: string, analysisData: any) => {
  // We'll store analyses in a subcollection for better organization
  const analysisRef = doc(db, `users/${uid}/analyses`, new Date().toISOString());
  return setDoc(analysisRef, { ...analysisData, createdAt: serverTimestamp() });
};

// Function to save a generated roadmap
export const saveRoadmap = async (uid: string, careerTitle: string, roadmapData: any) => {
  const roadmapRef = doc(db, `users/${uid}/roadmaps`, careerTitle);
  return setDoc(roadmapRef, { ...roadmapData, createdAt: serverTimestamp() });
};