import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CreateStory } from './CreateStory';

interface StoriesProps {
  stories: Story[];
  onStoryView: (storyId: string) => void;
}

export function Stories({ stories, onStoryView }: StoriesProps) {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyTimer, setStoryTimer] = useState<NodeJS.Timeout | null>(null);

  // Фильтруем активные истории (не истекшие)
  const activeStories = stories.filter(story => new Date() < story.expiresAt);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setStoryProgress(0);
    onStoryView(story.id);
    
    // Запускаем таймер на 15 секунд
    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          closeStoryViewer();
          return 100;
        }
        return prev + (100 / 150); // 15 секунд = 150 интервалов по 100мс
      });
    }, 100);
    
    setStoryTimer(timer);
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
    setStoryProgress(0);
    if (storyTimer) {
      clearInterval(storyTimer);
      setStoryTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (storyTimer) {
        clearInterval(storyTimer);
      }
    };
  }, [storyTimer]);

  const isStoryViewed = (story: Story) => {
    return user ? story.viewedBy.includes(user.id) : false;
  };

  return (
    <>
      <div className="px-4 mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* Add Story Button */}
          {user && (
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt="Your story"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
                <button 
                  onClick={() => setShowCreateStory(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 border-2 border-white hover:bg-blue-700 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <span className="text-xs text-gray-600 text-center">Your History</span>
            </div>
          )}

          {/* Stories */}
          {activeStories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                isStoryViewed(story)
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
              }`}>
                <img
                  src={story.userAvatar}
                  alt={story.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <span className="text-xs text-gray-600 text-center max-w-[60px] truncate">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-md w-full mx-4">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3 text-white">
                <img
                  src={selectedStory.userAvatar}
                  alt={selectedStory.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold">{selectedStory.username}</span>
                <span className="text-sm opacity-75">
                  {Math.floor((Date.now() - selectedStory.timestamp.getTime()) / 3600000)}ч
                </span>
              </div>
              <button
                onClick={closeStoryViewer}
                className="text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-2 left-4 right-4 h-0.5 bg-white bg-opacity-30 rounded-full z-10">
              <div 
                className="h-full bg-white rounded-full transition-all duration-100 ease-linear" 
                style={{ width: `${storyProgress}%` }} 
              />
            </div>

            {/* Story Content */}
            <div className="aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
              {selectedStory.media.type === 'image' ? (
                <img
                  src={selectedStory.media.url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={selectedStory.media.url}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Story Info */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-sm opacity-75">
                Просмотрели: {selectedStory.viewedBy.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStory onClose={() => setShowCreateStory(false)} />
      )}
    </>
  );
}