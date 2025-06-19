/**
 * @fileoverview User profile service for Firestore operations
 * @module services/auth/profileService
 * 
 * Dependencies: Firebase Firestore, Authentication types
 * Usage: Handle user profile CRUD operations in Firestore
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  type DocumentReference,
  type DocumentSnapshot,
  type FieldValue
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserProfile } from "@/types/auth";

/**
 * Get user profile from Firestore
 * @param uid User's unique identifier
 * @returns User profile or null if not found
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef: DocumentReference = doc(db, "users", uid);
    const userDocSnap: DocumentSnapshot = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        language: data.language || "en",
        proficiencyLevel: data.proficiencyLevel || "intermediate",
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

/**
 * Create new user profile in Firestore
 * @param uid User's unique identifier
 * @param profileData User profile data
 * @returns Created user profile
 */
export async function createUserProfile(
  uid: string, 
  profileData: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<UserProfile> {
  try {
    const userDocRef: DocumentReference = doc(db, "users", uid);
    const timestamp: FieldValue = serverTimestamp();
    
    const newProfile: Omit<UserProfile, "createdAt" | "updatedAt"> & {
      createdAt: FieldValue;
      updatedAt: FieldValue;
    } = {
      uid,
      email: profileData.email,
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      language: profileData.language,
      proficiencyLevel: profileData.proficiencyLevel,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await setDoc(userDocRef, newProfile);
    
    // Return the profile with actual dates
    return {
      uid,
      email: profileData.email,
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      language: profileData.language,
      proficiencyLevel: profileData.proficiencyLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw new Error("Failed to create user profile");
  }
}

/**
 * Update existing user profile in Firestore
 * @param uid User's unique identifier
 * @param updates Partial profile data to update
 * @returns Updated user profile
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>
): Promise<UserProfile> {
  try {
    const userDocRef: DocumentReference = doc(db, "users", uid);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(userDocRef, updateData);
    
    // Fetch and return the updated profile
    const updatedProfile = await getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error("Profile not found after update");
    }
    
    return updatedProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
} 
