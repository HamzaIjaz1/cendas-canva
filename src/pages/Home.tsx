import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUserDoc, signOut } from '../db'
import ConstructionCanvas from '../components/ConstructionCanvas'

export default function Home() {
  const navigate = useNavigate()
  const [name, setName] = useState<string>('')

  useEffect(() => {
    fetchUser()
  }, [navigate])

  const fetchUser = async () => {
    try {
      const userDoc = await getCurrentUserDoc()
      if (!userDoc) {
        navigate('/', { replace: true })
        return
      }
      setName(userDoc.get('name') as string)
    } catch(err) {
      console.error(err)
      navigate('/', { replace: true })
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Construction Plan Viewer</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Construction Plan</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <ConstructionCanvas className="w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
