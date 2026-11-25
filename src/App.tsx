import React, { useEffect } from 'react';
import { useCirclyStore } from './store/useCirclyStore';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { FeedView } from './components/feed/FeedView';
import { SearchExploreView } from './components/search/SearchExploreView';
import { ActivityView } from './components/activity/ActivityView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { ProfileView } from './components/profile/ProfileView';
import { FollowListView } from './components/profile/FollowListView';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { ComposerModal } from './components/composer/ComposerModal';
import { ThreadDetailModal } from './components/thread/ThreadDetailModal';
import { ToastContainer } from './components/ui/ToastContainer';

export const App: React.FC = () => {
  const { currentView, theme, openComposer, isComposerOpen, closeComposer, closeThreadDetail, initFromServer } = useCirclyStore();

  useEffect(() => {
    void initFromServer();
  }, [initFromServer]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Global desktop keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        (activeElement as HTMLElement).isContentEditable
      );

      // 'N' to open composer when not in input
      if ((e.key === 'n' || e.key === 'N') && !isInputActive && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openComposer();
      }

      // 'Escape' closes any open modals
      if (e.key === 'Escape') {
        closeComposer();
        closeThreadDetail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openComposer, closeComposer, closeThreadDetail]);

  const renderActiveView = () => {
    switch (currentView) {
      case 'explore':
        return <SearchExploreView />;
      case 'activity':
        return <ActivityView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'profile':
        return <ProfileView />;
      case 'connections':
        return <FollowListView />;
      case 'feed':
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F4F8F6] dark:bg-[#0B110F] text-[#0B1612] dark:text-[#F2FBF7] flex flex-col font-sans overflow-hidden transition-colors selection:bg-emerald-500/25 selection:text-emerald-800 dark:selection:text-emerald-200">
      
      {/* Mobile-only Top Navigation Header */}
      <Header />

      {/* Main Responsive 3-Column Layout Container */}
      <div className="w-full max-w-[1720px] mx-auto flex justify-between h-full overflow-hidden px-0 md:px-3 lg:px-6 xl:px-8">
        
        {/* Left Desktop Sidebar Navigation - Fixed in Place */}
        <DesktopSidebar />

        {/* Center Main Content Stream - Only this center area scrolls */}
        <main className="flex-1 min-w-0 max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto border-x border-[#E2ECE7] dark:border-[#1F2E29]/80 h-full overflow-y-auto pb-24 md:pb-12 bg-white dark:bg-[#0B110F]/60">
          {renderActiveView()}
        </main>

        {/* Right Desktop Discovery Rail - Fixed in Place */}
        <RightSidebar />

      </div>

      {/* Mobile Navigation Dock */}
      <BottomNav />

      {/* Global Modals */}
      <ComposerModal />
      <ThreadDetailModal />

      {/* Toast Notifications */}
      <ToastContainer />

    </div>
  );
};

export default App;
