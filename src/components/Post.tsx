import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post as PostType } from '../types';

interface PostProps {
  post: PostType;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  currentUserId?: string;
}

export function Post({ post, onLike, onComment, currentUserId }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const isLiked = currentUserId ? post.likedBy?.includes(currentUserId) : false;

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(post.id, newComment.trim());
      setNewComment('');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'Только что';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.userAvatar}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{post.username}</h4>
            {post.location && (
              <p className="text-sm text-gray-500">{post.location}</p>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="relative">
          <div className="aspect-square bg-gray-100">
            {post.media[currentMediaIndex].type === 'image' ? (
              <img
                src={post.media[currentMediaIndex].url}
                alt="Post content"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={post.media[currentMediaIndex].url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {post.media.length > 1 && (
            <>
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                {currentMediaIndex + 1}/{post.media.length}
              </div>
              <div className="flex justify-center space-x-2 py-2">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentMediaIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-700'
              } hover:text-red-500 transition-colors`}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <MessageCircle size={24} />
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Send size={24} />
            </button>
          </div>
          <button className="text-gray-700 hover:text-gray-900 transition-colors">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-gray-900 mb-2">
          {post.likes} {post.likes === 1 ? 'отметка "Нравится"' : 'отметок "Нравится"'}
        </p>

        {/* Caption */}
        {post.content && (
          <p className="text-gray-900">
            <span className="font-semibold">{post.username}</span> {post.content}
          </p>
        )}

        {/* Comments Preview */}
        {post.comments.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 text-sm hover:text-gray-700"
            >
              {showComments ? 'Скрыть' : `Посмотреть все комментарии (${post.comments.length})`}
            </button>
            
            {showComments && (
              <div className="mt-3 space-y-2">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <img
                      src={comment.userAvatar}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{comment.username}</span>{' '}
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-2">{formatTime(post.timestamp)}</p>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Добавьте комментарий..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
          {newComment.trim() && (
            <button
              type="submit"
              className="text-blue-600 font-semibold text-sm hover:text-blue-700"
            >
              Опубликовать
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
