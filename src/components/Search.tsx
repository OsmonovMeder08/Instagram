import React, { useState } from 'react';
import { Search as SearchIcon, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Search() {
  const { users, user, followUser, unfollowUser, isFollowing } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto pt-8 pb-20">
        <p className="text-center text-gray-500">Пожалуйста, войдите в систему, чтобы использовать поиск.</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pt-8 pb-20">
        <p className="text-center text-gray-500">Пользователи не найдены.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.id !== user.id &&
    (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFollowToggle = (userId: string) => {
    if (isFollowing(userId)) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-20 md:pb-4">
      <div className="px-4 md:px-0">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {searchQuery.trim() ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Результаты поиска</h2>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Пользователи не найдены</p>
              </div>
            ) : (
              filteredUsers.map((searchUser) => (
                <div
                  key={searchUser.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={searchUser.avatar}
                      alt={searchUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <h3 className="font-semibold text-gray-900 truncate">{searchUser.username}</h3>
                      <p className="text-sm text-gray-500 truncate">{searchUser.fullName}</p>
                      {searchUser.bio && (
                        <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{searchUser.bio}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {searchUser.followers} подписчиков • {searchUser.posts} публикаций
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollowToggle(searchUser.id)}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isFollowing(searchUser.id)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing(searchUser.id) ? (
                      <>
                        <UserMinus size={16} />
                        <span>Отписаться</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Подписаться</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">Начните вводить имя пользователя для поиска.</div>
        )}
      </div>
    </div>
  );
}
