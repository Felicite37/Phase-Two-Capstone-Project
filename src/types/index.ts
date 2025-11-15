// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string; // HTML content from editor
  excerpt?: string;
  slug: string;
  authorId: string;
  author?: User;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  coverImage?: string;
  readTime?: number;
}

// Draft type (local storage)
export interface Draft {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  coverImage?: string;
  lastSaved: Date;
}

// Editor state
export interface EditorState {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  isPublishing: boolean;
  isSaving: boolean;
}

