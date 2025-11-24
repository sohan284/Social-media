"use client";

import React from 'react';
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from 'react-icons/io5';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-[#0059ff] text-white rounded-br-md'
              : 'bg-gray-200 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <div className={`flex items-center mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {message.timestamp}
          </span>
          {isCurrentUser && (
            <div className="ml-1">
              {message.isRead ? (
                <span className="text-blue-500 text-xs"><IoCheckmarkDoneOutline size={16} /></span>
              ) : (
                <span className="text-gray-400 text-xs"><IoCheckmarkOutline size={16} /></span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
