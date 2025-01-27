import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, ENDPOINTS } from '../config'

interface NoteEditorProps {
  noteId?: string
  user: {
    id: string
    username: string
    token: string
  }
  onClose: () => void
}

interface Collaborator {
  _id: string
  username: string
}

interface Note {
  _id: string
  title: string
  content: string
  owner: Collaborator
  collaborators: Collaborator[]
  images: Array<{
    url: string
    caption: string
  }>
  updatedAt: string
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, user, onClose }) => {
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')

  useEffect(() => {
    if (noteId) {
      fetchNote()
    }
  }, [noteId])

  const fetchNote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.GET}/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch note')
      }
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const url = noteId 
        ? `${API_URL}${ENDPOINTS.NOTES.UPDATE}/${noteId}`
        : `${API_URL}${ENDPOINTS.NOTES.CREATE}`
      const method = noteId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save note')
      }

      if (!noteId) {
        navigate(`/notes/${data._id}`)
      } else {
        setNote(data)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCollaborator = async () => {
    if (!note) return

    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.NOTES.ADD_COLLABORATOR}/${note._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: collaboratorEmail })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add collaborator')
      }

      setNote(data)
      setCollaboratorEmail('')
      setShowCollaboratorModal(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add collaborator')
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!note) return

    try {
      const response = await fetch(
        `${API_URL}${ENDPOINTS.NOTES.REMOVE_COLLABORATOR}/${note._id}/${collaboratorId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove collaborator')
      }

      setNote(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove collaborator')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-xl font-semibold bg-transparent border-none focus:outline-none text-gray-900 dark:text-white w-full"
        />
        <div className="flex items-center space-x-2">
          {note && note.owner._id === user.id && (
            <button
              onClick={() => setShowCollaboratorModal(true)}
              className="btn btn-secondary"
            >
              Share
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={isLoading}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
        />
      </div>

      {note && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Collaborators:</span>
            {note.collaborators.map(collaborator => (
              <div
                key={collaborator._id}
                className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {collaborator.username}
                </span>
                {note.owner._id === user.id && collaborator._id !== user.id && (
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator._id)}
                    className="ml-2 text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Collaborator
            </h3>
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter email address"
              className="input w-full mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCollaboratorModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCollaborator}
                className="btn btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NoteEditor
