"use client";

import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import ConversationView from './ConversationView';
import { IoMdSend } from 'react-icons/io';
import MessageList from './MessageList';

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  timestamp?: string;
}

const MessagePopup = ({ isOpen, onClose }: MessagePopupProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-[#06133f] rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-300">
      {selectedUser ? (
        <ConversationView user={selectedUser} onBack={handleBackToList} />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#06133f] rounded-t-lg">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Messages</h3>
              <span className="bg-[#ff4500] text-white text-xs px-2 py-1 rounded-full font-medium">3</span>
            </div>
            <div className="flex items-center gap-1 text-white">
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-500 rounded-full transition-colors"
                title="Close"
              >
                <AiOutlineClose size={14} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-white pl-9 pr-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* New Message Input */}
          {showNewMessage && (
            <div className="p-3 border-b border-gray-200 bg-[#fff5f5]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Start a new message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4500] focus:border-transparent text-sm"
                />
                <button className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                  <IoMdSend size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-hidden">
            <MessageList searchQuery={searchQuery} onUserSelect={handleUserSelect} />
          </div>
        </>
      )}
    </div>
  );
};

export default MessagePopup;
