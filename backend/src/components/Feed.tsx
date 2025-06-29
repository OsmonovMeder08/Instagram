import React, { useState, useEffect } from 'react';
import { Post } from './Post';
import { Stories } from './Stories';
import { Post as PostType, Story } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка постов с backend
  useEffect(() => {
    async function fetchPosts() {
      if (!user) return;
      setLoadingPosts(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/posts?userId=${user.id}`);
        if (!res.ok) throw new Error('Ошибка загрузки постов');
        const data: PostType[] = await res.json();
        setPosts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingPosts(false);
      }
    }
    fetchPosts();
  }, [user]);

  // Загрузка сторис с backend
  useEffect(() => {
    async function fetchStories() {
      if (!user) return;
      setLoadingStories(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/stories?userId=${user.id}`);
        if (!res.ok) throw new Error('Ошибка загрузки сторис');
        const data: Story[] = await res.json();
        setStories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingStories(false);
      }
    }
    fetchStories();
  }, [user]);

  // Лайк или дизлайк поста — обновляем на backend и локально
  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Ошибка лайка');

      const updatedPost: PostType = await res.json();

      setPosts((prev) => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      alert('Не удалось поставить лайк');
    }
  };

  // Добавить комментарий — отправляем на backend и обновляем локально
  const handleComment = async (postId: string, content: string) => {
    if (!user) return;
    if (!content.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          userAvatar: user.avatar,
          content,
        }),
      });
      if (!res.ok) throw new Error('Ошибка комментария');

      const updatedPost: PostType = await res.json();

      setPosts((prev) => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      alert('Не удалось добавить комментарий');
    }
  };

  // Отметить сторис как просмотренную и отправить на backend
  const handleStoryView = async (storyId: string) => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:8000/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Ошибка отметки просмотра');

      const updatedStory: Story = await res.json();

      setStories((prev) => prev.map(s => s.id === storyId ? updatedStory : s));
    } catch (err) {
      // Можно игнорировать ошибку или показать сообщение
    }
  };

  if (loadingPosts || loadingStories) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Ошибка: {error}</div>;
  }

  // Фильтруем посты, чтобы показывать только от пользователя и тех, на кого подписан
  const feedPosts = posts.filter(post =>
    post.userId === user?.id || user?.followingList.includes(post.userId)
  );

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
