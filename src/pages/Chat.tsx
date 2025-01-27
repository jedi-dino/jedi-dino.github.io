import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, ENDPOINTS } from '../config'
import UserMenu from '../components/UserMenu'
import ThemeToggle from '../components/ThemeToggle'
import UserSearch from '../components/UserSearch'
import RecentChats from '../components/RecentChats'
import NotificationHandler from '../components/NotificationHandler'

interface User {
  id: string
  username: string
  token: string
}

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    username: string
  }
  recipient: {
    _id: string
    username: string
  }
  read: boolean
  createdAt: string
}

interface ChatUser {
  id: string
  username: string
}

interface ChatProps {
  user: User
  onLogout: () => void
}

const Chat: React.FC<ChatProps> = ({ user, onLogout }) => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.MESSAGES.GET}/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data)

      // Mark messages as read
      if (data.length > 0) {
        const lastMessage = data[data.length - 1]
        if (!lastMessage.read && lastMessage.sender._id === selectedUser.id) {
          await fetch(`${API_URL}${ENDPOINTS.MESSAGES.READ}/${selectedUser.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch messages')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.MESSAGES.SEND}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: newMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (message: Message) => {
    if (selectedUser && message.sender._id === selectedUser.id) {
      setMessages(prev => [...prev, message])
    } else if (notificationPermission === 'granted') {
      new Notification(`New message from ${message.sender.username}`, {
        body: message.content
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NotificationHandler onPermissionChange={setNotificationPermission} />
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
            <UserSearch
              user={user}
              onSelectUser={setSelectedUser}
              selectedUserId={selectedUser?.id}
            />
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Chats</h2>
              <RecentChats
                user={user}
                onSelectUser={setSelectedUser}
                selectedUserId={selectedUser?.id}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedUser ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedUser.username}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender._id === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {error && (
                    <div className="mb-4 text-red-500 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="btn btn-primary"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a user to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Chat
