'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function FinishSignInPage() {
  const [status, setStatus] = useState('Signing you in...')
  const router = useRouter()

  useEffect(() => {
    const signIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn')
        if (!email) {
          email = window.prompt('Please confirm your email')
        }

        try {
          await signInWithEmailLink(auth, email!, window.location.href)
          window.localStorage.removeItem('emailForSignIn')
          setStatus(`You're signed in! Redirecting...`)
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000) // Optional short delay for UX
        } catch (err: any) {
          console.error('Sign-in error:', err)

          if (err.code === 'auth/invalid-action-code') {
            setStatus(
              'Your sign-in link is invalid or has expired. Please request a new sign-in link.'
            )
          } else if (err.code === 'auth/user-disabled') {
            setStatus('This account has been disabled. Please contact support.')
          } else {
            setStatus('An unexpected error occurred during sign-in. Please try again.')
          }
        }

      }
    }

    signIn()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p>{status}</p>
    </div>
  )
}
