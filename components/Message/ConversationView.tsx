"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Image from 'next/image';
import MessageBubble from './MessageBubble';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import { useGetRoomMessagesQuery, useSendMessageMutation } from '@/store/chatApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  roomId?: number | string;
}

interface ConversationViewProps {
  user: User;
  onBack: () => void;
}

const ConversationView = ({ user, onBack }: ConversationViewProps) => {
  const [newMessage, setNewMessage] = useState('');
  const roomId = user.roomId || user.id;
  const { data: currentUser } = useGetCurrentUserProfileQuery();
  const { data: messagesResponse, isLoading: isLoadingMessages } = useGetRoomMessagesQuery(
    typeof roomId === 'string' && isNaN(Number(roomId)) ? 0 : (roomId as number | string),
    { skip: !roomId }
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  






     
  // Enable WebSocket for real-time messages in this room
  useChatWebSocket({ enabled: !!roomId });

  const currentUserId = useMemo(() => {
    return currentUser?.data?.id || currentUser?.id || currentUser?.user?.id;
  }, [currentUser]);

  const messages = useMemo(() => {
    if (!messagesResponse) return [];
    const messagesData = 
      messagesResponse.data ??
      messagesResponse.results?.data ??
      messagesResponse.messages ??
      [];
    
    return messagesData.map((msg: {
      id: number | string;
      content?: string;
      text?: string;
      sender?: { id?: number | string };
      user?: { id?: number | string };
      sender_id?: number | string;
      created_at?: string;
      is_read?: boolean;
    }) => {
      const senderId = msg.sender?.id || msg.user?.id || msg.sender_id;
      const isCurrentUser = String(senderId) === String(currentUserId);
      
      return {
        id: String(msg.id),
        text: msg.content || msg.text || '',
        senderId: isCurrentUser ? 'current-user' : String(senderId),
        timestamp: msg.created_at 
          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'just now',
        isRead: msg.is_read !== false,
      };
    });
  }, [messagesResponse, currentUserId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || isSending) return;
    
    try {
      await sendMessage({
        content: newMessage.trim(),
        room: roomId,
      }).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
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
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isCurrentUser={message.senderId === 'current-user'}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
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
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-[#0059ff] text-white rounded-full hover:bg-[#0059ffcd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PiPaperPlaneRightFill size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
