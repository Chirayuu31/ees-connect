export type Role = 'student' | 'alumni' | 'admin'

export type Profile = {
  id: string
  name: string
  email: string
  role: Role
  verified: boolean
  batch: number | null  // graduating year
  field: string | null  // e.g. Ecology, Hydrology, Atmospheric Science
  bio: string | null
  current_org: string | null
  mentor_available: boolean
  created_at: string
}

export type PostType = 'question' | 'opportunity' | 'resource' | 'discussion'

export type Post = {
  id: string
  author_id: string
  type: PostType
  title: string
  body: string
  tags: string[]
  link_url: string | null
  image_url: string | null
  expires_at: string | null
  created_at: string
  profiles: {
    name: string
    batch: number | null
    role: Role
  }
  comments?: CommentRow[]
}

export type CommentRow = {
  id: string
  post_id: string
  author_id: string
  body: string
  created_at: string
  profiles: {
    name: string
    batch: number | null
    role: Role
  }
}

export type ChatMessage = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
  read_at: string | null
}
