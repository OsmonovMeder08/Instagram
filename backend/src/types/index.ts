export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  followingList: string[]; // IDs пользователей, на которых подписан
  followersList: string[]; // IDs подписчиков
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  media: MediaItem[];
  likes: number;
  likedBy: string[]; // IDs пользователей, которые поставили лайк
  comments: Comment[];
  timestamp: Date;
  location?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  media: MediaItem;
  timestamp: Date;
  viewedBy: string[]; // IDs пользователей, которые просмотрели историю
  expiresAt: Date;
}