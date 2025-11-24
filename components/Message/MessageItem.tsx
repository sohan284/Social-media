"use client";

import React from 'react';
import Image from 'next/image';

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

interface MessageItemProps {
  message: Message;
  onUserSelect: (user: User) => void;
}

const MessageItem = ({ message, onUserSelect }: MessageItemProps) => {
  const handleClick = () => {
    const user: User = {
      id: message.sender.username,
      name: message.sender.name,
      avatar: message.sender.avatar,
      username: message.sender.username,
      isOnline: message.isOnline,
      timestamp: message.timestamp
    };
    onUserSelect(user);
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors group"
      onClick={handleClick}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Image
          src={message.sender.avatar}
          alt={message.sender.name}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        {message.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-white text-sm truncate group-hover:text-gray-300 transition-colors">
            {message.sender.name}
          </h4>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {message.timestamp}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate flex-1">
            {message.lastMessage}
          </p>
          {message.unreadCount > 0 && (
            <div className="bg-[#ff4500] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0 font-medium">
              {message.unreadCount > 9 ? '9+' : message.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
