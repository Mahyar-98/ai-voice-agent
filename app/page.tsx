'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendCallbackRequest } from './lib/actions'

export default function CallbackForm() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendCallbackRequest({ email, phone })
    window.localStorage.setItem('emailForSignIn', email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header Bar */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Voice AI Agent</h1>
        <button
          onClick={() => router.push('/login')}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow">
        <h2 className="text-2xl font-bold mb-6">Request a Callback</h2>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border p-2 w-full rounded"
            />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="border p-2 w-full rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 w-full rounded"
            >
              Request Call
            </button>
          </form>
        ) : (
          <p className="text-green-600">Thank you! You will receive a call shortly.</p>
        )}
      </main>
    </div>
  )
}
