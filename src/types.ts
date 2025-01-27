export interface User {
  id: string
  username: string
  token: string
  email?: string
  imageUrl?: string | undefined
}

export interface Note {
  _id: string
  title: string
  content: string
  owner: {
    _id: string
    username: string
  }
  collaborators: Array<{
    _id: string
    username: string
  }>
  images: Array<{
    url: string
    caption: string
  }>
  updatedAt: string
}
