"use client";

import React, { useState, useMemo } from 'react';
import { AiOutlineClose, AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import ConversationView from './ConversationView';
import MessageList from './MessageList';
import MessageUserList from './MessageUserList';
import { useGetChatRoomsQuery, useCreateChatRoomMutation } from '@/store/chatApi';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { toast } from 'sonner';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "rooms">("users");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const { data: roomsResponse } = useGetChatRoomsQuery(undefined, { skip: !isOpen });
  const [createRoom, { isLoading: isCreatingRoom }] = useCreateChatRoomMutation();
  
  // Initialize WebSocket connection when popup is open
  useChatWebSocket({ enabled: isOpen });

  const unreadCount = useMemo(() => {
    if (!roomsResponse) return 0;
    const rooms = roomsResponse.data ?? roomsResponse.results?.data ?? roomsResponse.rooms ?? [];
    return rooms.reduce((total: number, room: { unread_count?: number }) => total + (room.unread_count || 0), 0);
  }, [roomsResponse]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || isCreatingRoom) return;

    try {
      await createRoom({ name: roomName.trim() }).unwrap();
      toast.success('Room created successfully!');
      setRoomName('');
      setShowCreateRoom(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        'Failed to create room';
      toast.error('Failed to create room', { description: errorMessage });
    }
  };

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
              {unreadCount > 0 && (
                <span className="bg-[#ff4500] text-white text-xs px-2 py-1 rounded-full font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-white">
              <button 
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="p-1.5 hover:bg-gray-500 rounded-full transition-colors"
                title="Create Room"
              >
                <AiOutlinePlus size={14} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-500 rounded-full transition-colors"
                title="Close"
              >
                <AiOutlineClose size={14} />
              </button>
            </div>
          </div>

          {/* Create Room Input */}
          {showCreateRoom && (
            <div className="p-3 border-b border-gray-700 bg-[#06133f]">
              <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-transparent text-sm"
                  autoFocus
                  disabled={isCreatingRoom}
                />
                <button
                  type="submit"
                  disabled={!roomName.trim() || isCreatingRoom}
                  className="px-4 text-xs py-2 bg-[#0059ff] text-white rounded-md hover:bg-[#0059ffcd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isCreatingRoom ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setRoomName('');
                  }}
                  className="px-2 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  <AiOutlineClose size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Tabs */}
          <div className="px-3 pt-2 border-b border-gray-800 bg-[#06133f]">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-1.5 rounded-full cursor-pointer transition-colors ${
                  activeTab === "users"
                    ? "bg-white text-black font-semibold"
                    : "bg-transparent text-white/60 hover:text-white"
                }`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`flex-1 py-1.5 rounded-full cursor-pointer transition-colors ${
                  activeTab === "rooms"
                    ? "bg-white text-black font-semibold"
                    : "bg-transparent text-white/60 hover:text-white"
                }`}
              >
                Rooms
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder={activeTab === "users" ? "Search users..." : "Search messages..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-white pl-9 pr-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-transparent text-sm"
              />
            </div>
          </div>


          {/* Message / User List */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "users" ? (
              <MessageUserList searchQuery={searchQuery} onUserSelect={handleUserSelect} />
            ) : (
              <MessageList searchQuery={searchQuery} onUserSelect={handleUserSelect} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessagePopup;
