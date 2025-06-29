import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Feed } from './components/Feed';
import { Profile } from './components/Profile';
import { CreatePost } from './components/CreatePost';
import { Search } from './components/Search';
import { Search as SearchIcon, Heart } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleViewChange = (view: string) => {
    if (view === 'create') {
      setShowCreatePost(true);
    } else {
      setCurrentView(view);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'feed':
        return <Feed />;
      case 'search':
        return <Search />;
      case 'stories':
        return (
          <div className="max-w-2xl mx-auto pt-8 pb-20 md:pb-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
              </div>
              <h2 className="text-xl font-light text-gray-600 mb-2">History</h2>
              <p className="text-gray-500">Создавайте и просматривайте истории</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="max-w-2xl mx-auto pt-8 pb-20 md:pb-4">
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-light text-gray-600 mb-2">Notifications</h2>
              <p className="text-gray-500">Здесь появятся уведомления о активности</p>
            </div>
          </div>
        );
      case 'profile':
        return <Profile />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
            Meder
          </h1>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {renderMainContent()}
        </main>
      </div>

      {/* Navigation */}
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        userAvatar={user.avatar}
      />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}