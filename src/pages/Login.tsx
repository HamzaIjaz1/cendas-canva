import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findOrCreateUser, setCurrentUser } from '../db'

export default function Login() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name) {
      setError('Please enter your name')
      return
    }
    try {
      setLoading(true)
      const userDoc = await findOrCreateUser(name)
      await setCurrentUser(userDoc.get('id') as string)
      navigate('/home')
    } catch (err) {
      console.error(err)
      setError('Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">


        <div className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Enter your name to access your construction plans</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg"
            >
              {loading ? (
                <>
                  Signing you in...
                </>
              ) : (
                <>
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure access to your construction management tools
          </p>
        </div>
      </div>
    </div>
  )
}
