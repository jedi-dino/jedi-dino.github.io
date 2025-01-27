export const API_URL = 'https://testserverprobsfail.replit.app'

export const STORAGE_KEYS = {
  THEME: 'theme'
}

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100
  }
}

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout'
  },
  USERS: {
    SEARCH: '/api/users/search',
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/me',
    UPDATE_PROFILE_PICTURE: '/api/users/profile-picture',
    REMOVE_PROFILE_PICTURE: '/api/users/profile-picture'
  },
  MESSAGES: {
    GET: '/api/messages',
    SEND: '/api/messages',
    READ: '/api/messages/read',
    RECENT: '/api/messages/recent/chats',
    RECENT_CHATS: '/api/messages/recent/chats'
  },
  NOTES: {
    GET: '/api/notes',
    CREATE: '/api/notes',
    UPDATE: '/api/notes',
    DELETE: '/api/notes',
    ADD_COLLABORATOR: '/api/notes',
    REMOVE_COLLABORATOR: '/api/notes'
  }
}

export const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3): Promise<Response> => {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    credentials: 'same-origin' as RequestCredentials,
    mode: 'cors' as RequestMode,
    cache: 'no-cache' as RequestCache
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}: Sending request to ${url}`)
      const response = await fetch(url, mergedOptions)
      console.log(`Attempt ${i + 1}: Response status:`, response.status)
      return response
    } catch (error) {
      console.error(`Attempt ${i + 1}: Error:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('Failed after all retries')
}
