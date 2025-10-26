"use client";

import React from 'react';
import MessageItem from './MessageItem';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    username: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  timestamp?: string;
}

interface MessageListProps {
  searchQuery: string;
  onUserSelect: (user: User) => void;
}

const MessageList = ({ searchQuery, onUserSelect }: MessageListProps) => {
  // Mock data - replace with actual data from your API
  const messages: Message[] = [
    {
      id: '1',
      sender: {
        name: 'John Doe',
        avatar: '/profile.jpg',
        username: 'johndoe'
      },
      lastMessage: 'Hey, did you see the new post about React hooks?',
      timestamp: '2m',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      sender: {
        name: 'Sarah Wilson',
        avatar: '/profile.jpg',
        username: 'sarahw'
      },
      lastMessage: 'Thanks for the help with the project!',
      timestamp: '1h',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      sender: {
        name: 'Mike Johnson',
        avatar: '/profile.jpg',
        username: 'mikej'
      },
      lastMessage: 'Can we schedule a meeting for tomorrow?',
      timestamp: '3h',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '4',
      sender: {
        name: 'Emily Davis',
        avatar: '/profile.jpg',
        username: 'emilyd'
      },
      lastMessage: 'The new feature looks amazing!',
      timestamp: '1d',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '5',
      sender: {
        name: 'Alex Chen',
        avatar: '/profile.jpg',
        username: 'alexc'
      },
      lastMessage: 'Let me know when you\'re ready to test',
      timestamp: '2d',
      unreadCount: 0,
      isOnline: true
    }
  ];

  const filteredMessages = messages.filter(message =>
    message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {filteredMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm">No messages found</p>
            {searchQuery && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto custom-scroll overflow-hidden">
          {filteredMessages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              onUserSelect={onUserSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageList;
