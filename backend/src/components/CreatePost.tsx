import React, { useState } from 'react';
import { X, Image, Video, MapPin, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Post } from '../types';

interface CreatePostProps {
  onClose: () => void;
}

export function CreatePost({ onClose }: CreatePostProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useLocalStorage<Post[]>('posts', []);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && !mediaUrl.trim())) return;

    setIsLoading(true);

    try {
      const newPost: Post = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        content: content.trim(),
        media: mediaUrl.trim() ? [{
          id: Date.now().toString(),
          type: mediaType,
          url: mediaUrl.trim(),
        }] : [],
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date(),
        location: location.trim() || undefined,
      };

      setPosts([newPost, ...posts]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample images for demo
  const sampleImages = [
    'https://images.pexels.com/photos/1055613/pexels-photo-1055613.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Создать публикацию</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.fullName}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что у вас нового?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Media URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Добавить фото или видео
            </label>
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  mediaType === 'image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Image size={16} />
                <span className="text-sm">Фото</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  mediaType === 'video'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Video size={16} />
                <span className="text-sm">Видео</span>
              </button>
            </div>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={`Вставьте ссылку на ${mediaType === 'image' ? 'изображение' : 'видео'}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sample Images for Demo */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Или выберите из примеров:</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleImages.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMediaUrl(url)}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                >
                  <img
                    src={url}
                    alt={`Sample ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
              <MapPin size={16} />
              <span>Добавить местоположение</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Где вы находитесь?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {mediaUrl && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <p className="text-sm text-gray-600 p-2 border-b">Предварительный просмотр:</p>
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full aspect-square object-cover"
                />
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !mediaUrl.trim())}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Публикация...' : 'Опубликовать'}
          </button>
        </form>
      </div>
    </div>
  );
}