import React, { useRef } from 'react'
import { API_URL, ENDPOINTS } from '../config'

interface User {
  id: string
  username: string
  token: string
  imageUrl?: string
}

interface ProfilePictureProps {
  user: User
  onUpdateUser: (updatedUser: Partial<User>) => void
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ user, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to update profile picture')
      }

      const data = await response.json()
      onUpdateUser({ imageUrl: data.imageUrl })
    } catch (error) {
      console.error('Failed to update profile picture:', error)
    }
  }

  const handleRemoveImage = async () => {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.USERS.REMOVE_PROFILE_PICTURE}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to remove profile picture')
      }

      onUpdateUser({ imageUrl: undefined })
    } catch (error) {
      console.error('Failed to remove profile picture:', error)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        onClick={handleImageClick}
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl text-gray-500 dark:text-gray-400">
              {user.username[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm">Change Picture</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {user.imageUrl && (
        <button
          onClick={handleRemoveImage}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
        >
          Remove Picture
        </button>
      )}
    </div>
  )
}

export default ProfilePicture
