import React, { createContext, useContext } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'followers' | 'following' | 'posts' | 'followingList' | 'followersList'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'demo_user',
    email: 'demo@example.com',
    fullName: 'Демо Пользователь',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Фотограф и путешественник 📸✈️',
    followers: 1250,
    following: 890,
    posts: 45,
    followingList: ['2', '3'],
    followersList: ['2', '3', '4'],
  },
  {
    id: '2',
    username: 'nature_lover',
    email: 'nature@example.com',
    fullName: 'Любитель Природы',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Природа - мой дом 🌿🏔️',
    followers: 890,
    following: 456,
    posts: 32,
    followingList: ['1', '3'],
    followersList: ['1', '4'],
  },
  {
    id: '3',
    username: 'photographer_pro',
    email: 'photo@example.com',
    fullName: 'Профессиональный Фотограф',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Профессиональная фотография 📷✨',
    followers: 2340,
    following: 123,
    posts: 78,
    followingList: ['1'],
    followersList: ['1', '2', '4'],
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserRaw] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', defaultUsers);

  // Защищённый сеттер user: добавляем default поля, если отсутствуют
  const setUser = (newUser: User | null) => {
    if (newUser) {
      const fixedUser = {
        ...newUser,
        followingList: Array.isArray(newUser.followingList) ? newUser.followingList : [],
        followersList: Array.isArray(newUser.followersList) ? newUser.followersList : [],
      };
      setUserRaw(fixedUser);
    } else {
      setUserRaw(null);
    }
  };

  // Заменённая функция login для вызова backend FastAPI
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);

      const userResponse = await fetch('http://127.0.0.1:8000/users/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!userResponse.ok) {
        return false;
      }

      const currentUser = await userResponse.json();
      setUser(currentUser);
      return true;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'followers' | 'following' | 'posts' | 'followingList' | 'followersList'>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const existingUser = users.find(u => u.email === userData.email || u.username === userData.username);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      followers: 0,
      following: 0,
      posts: 0,
      followingList: [],
      followersList: [],
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...userData,
        followingList: Array.isArray(user.followingList) ? user.followingList : [],
        followersList: Array.isArray(user.followersList) ? user.followersList : [],
      };
      setUser(updatedUser);
      setUsers(users.map(u => (u.id === user.id ? updatedUser : u)));
    }
  };

  const followUser = (userId: string) => {
    if (!user || userId === user.id) return;

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          followingList: [...(Array.isArray(u.followingList) ? u.followingList : []), userId],
          following: u.following + 1,
        };
      }
      if (u.id === userId) {
        return {
          ...u,
          followersList: [...(Array.isArray(u.followersList) ? u.followersList : []), user.id],
          followers: u.followers + 1,
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    const updatedCurrentUser = updatedUsers.find(u => u.id === user.id);
    if (updatedCurrentUser) {
      setUser(updatedCurrentUser);
    }
  };

  const unfollowUser = (userId: string) => {
    if (!user || userId === user.id) return;

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          followingList: (Array.isArray(u.followingList) ? u.followingList : []).filter(id => id !== userId),
          following: Math.max(0, u.following - 1),
        };
      }
      if (u.id === userId) {
        return {
          ...u,
          followersList: (Array.isArray(u.followersList) ? u.followersList : []).filter(id => id !== user.id),
          followers: Math.max(0, u.followers - 1),
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    const updatedCurrentUser = updatedUsers.find(u => u.id === user.id);
    if (updatedCurrentUser) {
      setUser(updatedCurrentUser);
    }
  };

  const isFollowing = (userId: string): boolean => {
    return user?.followingList?.includes(userId) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        register,
        logout,
        updateProfile,
        followUser,
        unfollowUser,
        isFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
