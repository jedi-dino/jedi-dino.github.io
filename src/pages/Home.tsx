import React from 'react'
import { useNavigate } from 'react-router-dom'
import UserMenu from '../components/UserMenu'
import ThemeToggle from '../components/ThemeToggle'

interface HomeProps {
  user: {
    id: string
    username: string
    token: string
  }
  onLogout: () => void
}

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.username}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => navigate('/chat')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chat</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with others through instant messaging. Share text, images, and videos in real-time conversations.
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/notes')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notes</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Create and collaborate on documents. Add images, invite others via email, and organize your thoughts together.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
