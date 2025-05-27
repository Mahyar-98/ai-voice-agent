'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        try {
          const q = query(
            collection(db, 'callSessions'),
            where('email', '==', currentUser.email)
          )
          const snapshot = await getDocs(q)
          const results = snapshot.docs.map(doc => ({
            id: doc.id, // include the document ID
            ...doc.data()
          }))

          console.log('Fetched sessions:', results) // for debugging
          setSessions(results)
        } catch (err) {
          console.error('Failed to fetch sessions:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <p className="p-4">Loading...</p>

  if (!user) {
    return <p className="p-4">You must be signed in to view the dashboard.</p>
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setTimeout(() => {
        router.push('/')
      }, 2000) // 2-second delay before redirecting
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }


  return (
    <div className="p-4 max-w-5xl mx-auto">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Voice Callback Sessions</h1>
  <button
    onClick={handleLogout}
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
  >
    Log out
  </button>
</div>
      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions found for your account.</p>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="mb-6 border rounded-lg shadow p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Session ID: {session.id}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Date:{' '}
              {session.createdAt
                ? new Date(session.createdAt.seconds * 1000).toLocaleString()
                : '—'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {session.answers &&
                Object.entries(session.answers).map(([label, value]) => (
                  <div key={label}>
                    <span className="font-medium">{label}:</span>{' '}
                    {typeof value === 'string' || typeof value === 'number' ? (
                      value
                    ) : value ? (
                      JSON.stringify(value)
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
