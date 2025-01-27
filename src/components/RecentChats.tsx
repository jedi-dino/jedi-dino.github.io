import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, ENDPOINTS } from '../config'

interface ChatUser {
  id: string
  username: string
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

interface RecentChat {
  id: string
  username: string
  lastMessage: Message
}

interface RecentChatsProps {
  token: string
  currentUserId: string
  selectedUserId?: string
  onSelectUser: (user: ChatUser) => void
}

const RecentChats: React.FC<RecentChatsProps> = ({ token, currentUserId, selectedUserId, onSelectUser }) => {
  const [chats, setChats] = useState<RecentChat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const response = await fetch(`${API_URL}${ENDPOINTS.MESSAGES.RECENT_CHATS}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch recent chats')
        }

        const data = await response.json()
        setChats(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch recent chats')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentChats()
  }, [token])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-4">
        {error}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center p-4">
        No recent chats
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chats.map(chat => (
        <div
          key={chat.id}
          onClick={() => onSelectUser({ id: chat.id, username: chat.username })}
          className={`flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
            selectedUserId === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
        >
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {chat.username}
            </h3>
            {chat.lastMessage && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {chat.lastMessage.content}
              </p>
            )}
          </div>
          {chat.lastMessage && !chat.lastMessage.read && chat.lastMessage.sender._id !== currentUserId && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      ))}
    </div>
  )
}

export default RecentChats
