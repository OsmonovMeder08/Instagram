import React, { useState, useEffect } from 'react';
import { Post } from './Post';
import { Stories } from './Stories';
import { Post as PostType, Story } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const mockPosts: PostType[] = [
  {
    id: '1',
    userId: '1',
    username: 'demo_user',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Прекрасный день для фотосессии! 📸',
    media: [
      {
        id: '1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1055613/pexels-photo-1055613.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ],
    likes: 42,
    likedBy: ['2', '3'],
    comments: [
      {
        id: '1',
        userId: '2',
        username: 'photographer_pro',
        userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'Невероятный кадр! 👏',
        timestamp: new Date(Date.now() - 3600000),
        likes: 5,
      },
    ],
    timestamp: new Date(Date.now() - 7200000),
    location: 'Москва, Россия',
  },
  {
    id: '2',
    userId: '2',
    username: 'nature_lover',
    userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Закат в горах. Природа вдохновляет каждый день 🌄',
    media: [
      {
        id: '2',
        type: 'image',
        url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
      },
    ],
    likes: 128,
    likedBy: ['1', '3'],
    comments: [],
    timestamp: new Date(Date.now() - 14400000),
  },
];

const mockStories: Story[] = [
  {
    id: '1',
    userId: '1',
    username: 'demo_user',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    media: {
      id: '1',
      type: 'image',
      url: 'https://images.pexels.com/photos/1055613/pexels-photo-1055613.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    timestamp: new Date(Date.now() - 3600000),
    viewedBy: ['2'],
    expiresAt: new Date(Date.now() + 82800000), // 23 часа от текущего времени
  },
  {
    id: '2',
    userId: '2',
    username: 'nature_lover',
    userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    media: {
      id: '2',
      type: 'image',
      url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    timestamp: new Date(Date.now() - 7200000),
    viewedBy: ['1'],
    expiresAt: new Date(Date.now() + 79200000), // 22 часа от текущего времени
  },
];

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useLocalStorage<PostType[]>('posts', mockPosts);
  const [stories, setStories] = useLocalStorage<Story[]>('stories', mockStories);

  // Фильтруем посты только от пользователей, на которых подписан текущий пользователь
  const feedPosts = posts.filter(post => 
    post.userId === user?.id || (user?.followingList && user.followingList.includes(post.userId))
  );

  const handleLike = (postId: string) => {
    if (!user) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(user.id);
        return {
          ...post,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== user.id)
            : [...post.likedBy, user.id],
          likes: isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    if (!user) return;

    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content,
      timestamp: new Date(),
      likes: 0,
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    }));
  };

  const handleStoryView = (storyId: string) => {
    if (!user) return;

    setStories(stories.map(story => {
      if (story.id === storyId && !story.viewedBy.includes(user.id)) {
        return {
          ...story,
          viewedBy: [...story.viewedBy, user.id],
        };
      }
      return story;
    }));
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-20 md:pb-4">
      {/* Stories */}
      <Stories stories={stories} onStoryView={handleStoryView} />
      
      {/* Posts */}
      <div className="px-4 md:px-0">
        {feedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Пока нет постов</p>
            <p className="text-gray-400 text-sm mt-2">Подпишитесь на пользователей или создайте свой первый пост!</p>
          </div>
        ) : (
          feedPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}