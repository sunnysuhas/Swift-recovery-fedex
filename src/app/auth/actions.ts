'use server';

import { initializeFirebase } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function login(email: string, password: string) {
  // This is a server action, but it returns a custom token to the client.
  // The client then uses this token to sign in with the client SDK.
  // This is a common pattern to avoid exposing password to the client-side code directly.
  // We will need a way to pass the custom token back to the client.
  // For now, this is a placeholder. A full implementation would involve an API route
  // or another mechanism to pass the token securely.
  
  // This is a simplified example and does not represent a secure login flow.
  // In a real application, you would use the Firebase client SDK to sign in directly,
  // or use a secure method to exchange credentials for a session cookie or token.
  
  try {
    // Note: The admin SDK does not have a `signInWithEmailAndPassword` method.
    // This is a conceptual representation. Proper auth flow would be client-side.
    // We are simulating a login for the purpose of the demo.
    // This will be replaced with client-side SDK calls.
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signup(email: string, password: string, displayName: string) {
    const { auth, firestore } = initializeFirebase();

    try {
        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        // This is a hack for the demo. In a real app, dcaId would be set through a proper admin/invite flow.
        const isDcaAgent = email.includes('dca');
        const userRole = isDcaAgent ? 'DCA_Agent' : 'Admin';
        const dcaId = isDcaAgent ? 'dca-2' : undefined; // Assign to 'Credit Solutions' for demo

        // Create a user document in Firestore
        await firestore.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: userRole,
            dcaId: dcaId
        });

        return { success: true, uid: userRecord.uid };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function logout() {
    // This would typically be a client-side action that calls signOut()
    // from the Firebase client SDK.
    // For now, we simulate a logout by redirecting.
    // A server action can't directly sign out a client.
    return { success: true };
}
