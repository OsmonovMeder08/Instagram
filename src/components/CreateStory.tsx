import React, { useState } from 'react';
import { X, Image, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Story } from '../types';

interface CreateStoryProps {
  onClose: () => void;
}

export function CreateStory({ onClose }: CreateStoryProps) {
  const { user } = useAuth();
  const [stories, setStories] = useLocalStorage<Story[]>('stories', []);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mediaUrl.trim()) return;

    setIsLoading(true);

    try {
      const newStory: Story = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar || '', // добавлена защита
        media: {
          id: Date.now().toString(),
          type: mediaType,
          url: mediaUrl.trim(),
        },
        timestamp: new Date().toISOString(), // строка, чтобы сериализовалась
        viewedBy: [],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // строка для хранения
      };

      setStories([newStory, ...stories]);
      onClose();
    } catch (error) {
      console.error('Ошибка при создании истории:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleImages = [
    'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Создать историю</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {user && (
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || ''}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-500">История исчезнет через 24 часа</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип контента</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ссылка на {mediaType === 'image' ? 'изображение' : 'видео'}
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={`Вставьте ссылку на ${mediaType === 'image' ? 'изображение' : 'видео'}`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {mediaType === 'image' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Или выберите из примеров:</p>
              <div className="grid grid-cols-2 gap-2">
                {sampleImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setMediaUrl(url)}
                    className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
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
          )}

          {mediaUrl && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <p className="text-sm text-gray-600 p-2 border-b">Предварительный просмотр:</p>
              <div className="aspect-[9/16] bg-gray-100">
                {mediaType === 'image' ? (
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !mediaUrl.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Создание истории...' : 'Поделиться историей'}
          </button>
        </form>
      </div>
    </div>
  );
}
