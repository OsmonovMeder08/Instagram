import React, { useState } from 'react';
import { Settings, Grid, Bookmark, UserPlus, Edit2, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Post } from '../types';

export function Profile() {
  const { user, users, updateProfile, logout, followUser, unfollowUser, isFollowing } = useAuth();
  const [posts] = useLocalStorage<Post[]>('posts', []);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
  });

  const userPosts = posts.filter(post => post.userId === user?.id);

  const handleSaveProfile = () => {
    if (user) {
      updateProfile({
        fullName: editForm.fullName,
        bio: editForm.bio,
      });
      setIsEditingProfile(false);
    }
  };

  const handleFollowToggle = (userId: string) => {
    if (isFollowing(userId)) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const getFollowers = () => {
    return users.filter(u => user?.followersList.includes(u.id));
  };

  const getFollowing = () => {
    return users.filter(u => user?.followingList.includes(u.id));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-20 md:pb-4">
      <div className="px-4 md:px-0">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-8">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <h1 className="text-2xl font-light">{user.username}</h1>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Edit2 size={14} />
                <span>Редактировать профиль</span>
              </button>
              <button className="text-gray-700 hover:text-gray-900">
                <Settings size={24} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{userPosts.length}</div>
                <div className="text-gray-600 text-sm">публикаций</div>
              </div>
              <button 
                onClick={() => setShowFollowers(true)}
                className="text-center hover:text-gray-700"
              >
                <div className="font-semibold text-lg">{user.followers}</div>
                <div className="text-gray-600 text-sm">подписчиков</div>
              </button>
              <button 
                onClick={() => setShowFollowing(true)}
                className="text-center hover:text-gray-700"
              >
                <div className="font-semibold text-lg">{user.following}</div>
                <div className="text-gray-600 text-sm">подписок</div>
              </button>
            </div>

            {/* Bio */}
            <div className="max-w-md">
              <h2 className="font-semibold">{user.fullName}</h2>
              {user.bio && (
                <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-300">
          <div className="flex justify-center space-x-16">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-1 py-3 text-sm font-medium border-t-2 ${
                activeTab === 'posts'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid size={16} />
              <span>ПУБЛИКАЦИИ</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-1 py-3 text-sm font-medium border-t-2 ${
                activeTab === 'saved'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bookmark size={16} />
              <span>СОХРАНЕННОЕ</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <>
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Grid size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-light mb-2">Поделитесь фотографиями</h3>
                  <p className="text-gray-500">
                    Когда вы поделитесь фотографиями, они появятся в вашем профиле.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                    >
                      {post.media.length > 0 && (
                        <img
                          src={post.media[0].url}
                          alt="Post"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bookmark size={24} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-2">Сохраненные публикации</h3>
              <p className="text-gray-500">
                Здесь будут отображаться сохраненные вами публикации.
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Редактировать профиль</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Подписчики</h2>
              <button
                onClick={() => setShowFollowers(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {getFollowers().map((follower) => (
                <div key={follower.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={follower.avatar}
                      alt={follower.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{follower.username}</p>
                      <p className="text-sm text-gray-500">{follower.fullName}</p>
                    </div>
                  </div>
                  {follower.id !== user.id && (
                    <button
                      onClick={() => handleFollowToggle(follower.id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isFollowing(follower.id)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFollowing(follower.id) ? 'Отписаться' : 'Подписаться'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Подписки</h2>
              <button
                onClick={() => setShowFollowing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {getFollowing().map((following) => (
                <div key={following.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={following.avatar}
                      alt={following.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{following.username}</p>
                      <p className="text-sm text-gray-500">{following.fullName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => unfollowUser(following.id)}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Отписаться
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}