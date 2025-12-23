"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Image from 'next/image';
import MessageBubble from './MessageBubble';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import { useGetConversationQuery, useSendDirectMessageMutation, chatApi } from '@/store/chatApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { store } from '@/store/store';
import { getApiBaseUrl } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ConversationViewProps {
  user: User;
  onBack: () => void;
}

const ConversationView = ({ user, onBack }: ConversationViewProps) => {
  const apiBase = getApiBaseUrl();
  const [newMessage, setNewMessage] = useState('');
  const userId = user.id; // Use user ID for direct messaging
  const { data: currentUser } = useGetCurrentUserProfileQuery();
  
  const formatLastSeen = (lastSeenString: string) => {
    if (!lastSeenString) return 'recently';
    const lastSeen = new Date(lastSeenString);
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return lastSeen.toLocaleDateString([], { month: 'short', day: 'numeric', year: lastSeen.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };
  
  const { data: messagesResponse, isLoading: isLoadingMessages } = useGetConversationQuery(
    userId,
    { 
      skip: !userId,
      refetchOnMountOrArgChange: true,
    }
  );
  const [sendDirectMessage, { isLoading: isSending }] = useSendDirectMessageMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = useMemo(() => {
    return currentUser?.data?.id || currentUser?.id || currentUser?.user?.id;
  }, [currentUser]);
  
  // Get user info from response (includes last_seen)
  const userInfo = useMemo(() => {
    if (!messagesResponse) return null;
    return (messagesResponse as { user?: { is_online?: boolean; last_seen?: string; [key: string]: unknown } }).user;
  }, [messagesResponse]);
  
  // Update user online status and last seen from API response
  const updatedUser = useMemo(() => {
    if (userInfo) {
      return {
        ...user,
        isOnline: userInfo.is_online || false,
        lastSeen: userInfo.last_seen,
      };
    }
    return user;
  }, [user, userInfo]);
  
  // Enable WebSocket for real-time messages
  useChatWebSocket({ 
    enabled: !!userId && typeof userId !== 'undefined',
    onMessage: (data) => {
      // Invalidate messages to refetch when new message arrives via WebSocket
      if (data.type === 'message' && data.message) {
        // Check if message is for this conversation
        const message = data.message as { sender_id?: number | string; receiver_id?: number | string };
        if (
          (String(message.sender_id) === String(userId) && String(message.receiver_id) === String(currentUserId)) ||
          (String(message.receiver_id) === String(userId) && String(message.sender_id) === String(currentUserId))
        ) {
          store.dispatch(chatApi.util.invalidateTags([{ type: "Messages", id: userId }]));
          store.dispatch(chatApi.util.invalidateTags(["Conversations"]));
        }
      }
    }
  });

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
          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          : 'just now',
        isRead: msg.is_read !== false,
      };
    });
  }, [messagesResponse, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || isSending) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      // Send direct message via REST API
      await sendDirectMessage({
        receiver_id: userId,
        content: messageContent,
      }).unwrap();
      
      // The backend will broadcast via WebSocket automatically
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on error
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
          {updatedUser.avatar && updatedUser.avatar !== "/profile.jpg" && !updatedUser.avatar.includes("profile.jpg") ? (
            <Image
              src={`${apiBase}${updatedUser.avatar?.startsWith('/') ? updatedUser.avatar?.slice(1) : updatedUser.avatar}`}
              alt={updatedUser.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c3f79] via-[#995a98] to-[#6c3f79] flex items-center justify-center text-white text-xs font-semibold">
              {updatedUser.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${updatedUser.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{updatedUser.name}</h3>
          <p className="text-xs text-gray-500">
            {updatedUser.isOnline ? 'Online' : (updatedUser.lastSeen ? `Last seen ${formatLastSeen(updatedUser.lastSeen)}` : 'Offline')}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={1}
            placeholder={`Message ${user.name}...`}
            className="flex-1 px-3 py-3 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-transparent text-sm text-white resize-none custom-scroll"
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
