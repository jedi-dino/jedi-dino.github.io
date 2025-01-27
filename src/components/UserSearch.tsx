import React, { useState } from 'react'
import { API_URL, ENDPOINTS } from '../config'

interface User {
  id: string
  username: string
  token: string
}

interface SearchResult {
  _id: string
  username: string
}

interface UserSearchProps {
  user: User
  selectedUserId?: string
  onSelectUser: (user: { id: string; username: string }) => void
}

const UserSearch: React.FC<UserSearchProps> = ({ user, selectedUserId, onSelectUser }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS.SEARCH}?username=${value}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to search users')
      }

      const data = await response.json()
      setResults(data)
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search users')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (result: SearchResult) => {
    onSelectUser({ id: result._id, username: result.username })
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search users..."
        className="input"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <ul className="max-h-60 overflow-auto">
            {results.map(result => (
              <li
                key={result._id}
                onClick={() => handleSelectUser(result)}
                className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedUserId === result._id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                {result.username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default UserSearch
