"use client";

import React, { useMemo } from 'react';
import MessageItem from './MessageItem';
import { useGetChatRoomsQuery, type ChatRoom, type ChatUser } from '@/store/chatApi';
import { getApiBaseUrl } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  timestamp?: string;
  roomId?: number | string;
}

interface MessageListProps {
  searchQuery: string;
  onUserSelect: (user: User) => void;
}

const MessageList = ({ searchQuery, onUserSelect }: MessageListProps) => {
  const { data: roomsResponse, isLoading, isError } = useGetChatRoomsQuery();

  const rooms = useMemo(() => {
    if (!roomsResponse) return [];
    return (
      roomsResponse.data ??
      roomsResponse.results?.data ??
      roomsResponse.rooms ??
      []
    );
  }, [roomsResponse]);

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (room: ChatRoom) => {
    // Get the participant that is not the current user
    // This assumes participants array contains users
    if (room.participants && Array.isArray(room.participants) && room.participants.length > 0) {
      // Return the first participant (or you might need logic to exclude current user)
      return room.participants[0];
    }
    // Fallback to room data
    const roomData = room as ChatRoom & { user?: ChatUser; participant?: ChatUser; username?: string; avatar?: string };
    return {
      id: roomData.user?.id || roomData.participant?.id || room.id,
      username: roomData.user?.username || roomData.participant?.username || roomData.username || 'Unknown',
      display_name: roomData.user?.display_name || roomData.participant?.display_name || room.name || 'Unknown User',
      avatar: roomData.user?.avatar || roomData.participant?.avatar || roomData.avatar || '/profile.jpg',
      is_online: roomData.user?.is_online || roomData.participant?.is_online || false,
    };
  };

  const transformedRooms = useMemo(() => {
    return rooms.map((room: ChatRoom) => {
      const participant = getOtherParticipant(room);
      const lastMessage = (room.last_message as { content?: string; created_at?: string } | undefined) || {};
      const apiBase = getApiBaseUrl();
      
      return {
        id: String(room.id),
        roomId: room.id,
        sender: {
          name: participant.display_name || participant.username || 'Unknown',
          avatar: participant.avatar 
            ? (participant.avatar.startsWith('http') 
                ? participant.avatar 
                : `${apiBase}${participant.avatar.startsWith('/') ? participant.avatar.slice(1) : participant.avatar}`)
            : '/profile.jpg',
          username: participant.username || 'unknown',
        },
        lastMessage: lastMessage.content || 'No messages yet',
        timestamp: formatTimestamp(lastMessage.created_at || room.updated_at || room.created_at),
        unreadCount: room.unread_count || 0,
        isOnline: participant.is_online || false,
      };
    });
  }, [rooms]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return transformedRooms;
    const query = searchQuery.toLowerCase();
    return transformedRooms.filter((message) =>
      message.sender.name.toLowerCase().includes(query) ||
      message.sender.username.toLowerCase().includes(query) ||
      message.lastMessage.toLowerCase().includes(query)
    );
  }, [transformedRooms, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center mt-5">
          <p className="text-sm">Failed to load conversations</p>
          <p className="text-xs mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {filteredMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {searchQuery && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
            {!searchQuery && (
              <p className="text-xs mt-1">Start a new conversation to get started</p>
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
