'use server'

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { sendSignInLinkToEmail } from 'firebase/auth'
import { auth, db } from './firebase'

export const sendCallbackRequest = async ({ email, phone } : 
  {
  email: string
  phone: string
  }) => {
    await addDoc(collection(db, 'callbackRequests'), {
      email,
      phone,
      createdAt: serverTimestamp(),
    })

    const host = process.env.NEXT_PUBLIC_BASE_HOST || 'http://localhost';
    const port = process.env.NEXT_PUBLIC_BASE_PORT || '3000';

    const baseUrl = `${host}:${port}`;

    const actionCodeSettings = {
      url: `${baseUrl}/finishSignIn`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings)

    return { success: true }
}
