"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Image from 'next/image';
import MessageBubble from './MessageBubble';
import { PiPaperPlaneRightFill } from 'react-icons/pi';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
}

interface ConversationViewProps {
  user: User;
  onBack: () => void;
}

const ConversationView = ({ user, onBack }: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey, did you see the new post about React hooks?',
      senderId: user.id,
      timestamp: '2:30 PM',
      isRead: true
    },
    {
      id: '2',
      text: 'Yes! It\'s really interesting. I\'ve been using them in my latest project.',
      senderId: 'current-user',
      timestamp: '2:32 PM',
      isRead: true
    },
    {
      id: '3',
      text: 'That\'s awesome! Which hooks are you using the most?',
      senderId: user.id,
      timestamp: '2:35 PM',
      isRead: true
    },
    {
      id: '4',
      text: 'Mainly useState and useEffect, but I\'m starting to explore useCallback and useMemo for optimization.',
      senderId: 'current-user',
      timestamp: '2:37 PM',
      isRead: true
    },
    {
      id: '5',
      text: 'Nice! Those are great for performance. Have you tried useReducer yet?',
      senderId: user.id,
      timestamp: '2:40 PM',
      isRead: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        senderId: 'current-user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-[#06133f] rounded-t-3xl">
        <button 
          onClick={onBack}
          className="p-1 hover:bg-gray-500 rounded-full transition-colors text-white"
        >
          <AiOutlineArrowLeft size={18} />
        </button>
        
        <div className="relative flex-shrink-0">
          <Image
            src={user.avatar}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          {user.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{user.name}</h3>
          <p className="text-xs text-gray-500">
            {user.isOnline ? 'Online' : `Last seen ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isCurrentUser={message.senderId === 'current-user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-[#06133f] rounded-b-3xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <textarea

            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={1}
            placeholder={`Message ${user.name}...`}
            className="flex-1 px-3 py-3 border border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-transparent text-sm text-white resize-none custom-scroll"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PiPaperPlaneRightFill  size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
