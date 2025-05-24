import React, { useState } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ConsentRecorder from './components/ConsentRecorder';
import NotificationSystem from './components/NotificationSystem';
import { Notification } from './types';

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [watchedDuration, setWatchedDuration] = useState(0);

  const addNotification = (message: string, type: 'info' | 'success' | 'error') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
          <VideoPlayer 
            src="https://www.example.com/sample-video.mp4" 
            poster="https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            onWatchTimeUpdate={setWatchedDuration}
          />
          <ConsentRecorder onNotify={addNotification} watchedDuration={watchedDuration} />
        </div>
      </main>
      
      <NotificationSystem 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </div>
  );
}

export default App;