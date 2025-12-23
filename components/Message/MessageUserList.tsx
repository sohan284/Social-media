"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  useGetConversationsListQuery,
  useSearchChatUsersQuery,
  type ChatUser,
  type ConversationItem,
} from "@/store/chatApi";
import { getApiBaseUrl } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: string;
  timestamp?: string;
  roomId?: number | string;
}

interface MessageUserListProps {
  searchQuery: string;
  onUserSelect: (user: User) => void;
}

const MessageUserList = ({ searchQuery, onUserSelect }: MessageUserListProps) => {
  const apiBase = getApiBaseUrl();
  // Use search if query exists, otherwise get conversations list
  const shouldSearch = searchQuery.trim().length >= 2;
  const { data: conversationsResponse, isLoading: isLoadingConversations } = useGetConversationsListQuery(undefined, {
    skip: shouldSearch,
    refetchOnMountOrArgChange: true,
  });
  const { data: searchResponse, isLoading: isLoadingSearch } = useSearchChatUsersQuery(
    searchQuery.trim(),
    { skip: !shouldSearch }
  );

  const isLoading = isLoadingConversations || isLoadingSearch;

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

  const conversations = useMemo(() => {
    if (shouldSearch) {
      // For search, return users without conversation data
      if (!searchResponse) return [];
      const usersData = searchResponse.data ?? searchResponse.results?.data ?? searchResponse.users ?? [];
      return usersData.map((user: ChatUser) => ({
        id: String(user.id),
        name: user.display_name || user.username || "Unknown User",
        username: user.username || String(user.id),
        email: user.email || "",
        avatar: user.avatar || "/profile.jpg",
        isOnline: user.is_online || false,
        lastSeen: (user as { last_seen?: string }).last_seen,
        lastMessage: 'Click to start conversation',
        timestamp: '',
        unreadCount: 0,
      }));
    }
    
    // For conversations list, show users with last message and unread count
    if (!conversationsResponse) return [];
    const conversationsData = conversationsResponse.data ?? conversationsResponse.results?.data ?? conversationsResponse.conversations ?? [];
    
    return conversationsData.map((conversation: ConversationItem) => {
      const user = conversation.user || {} as ChatUser;
      const lastMessage = conversation.last_message || {} as { content?: string; created_at?: string };
      
      return {
        id: String(user.id || ''),
        name: user.display_name || user.username || "Unknown User",
        username: user.username || String(user.id),
        email: user.email || "",
        avatar: user.avatar || "/profile.jpg",
        isOnline: user.is_online || false,
        lastSeen: (user as { last_seen?: string }).last_seen,
        lastMessage: lastMessage.content || 'No messages yet',
        timestamp: formatTimestamp(lastMessage.created_at || conversation.last_message_time),
        unreadCount: conversation.unread_count || 0,
      };
    });
  }, [shouldSearch, conversationsResponse, searchResponse]);

  const handleUserClick = async (conversation: typeof conversations[0]) => {
    // For direct messaging, we just need the user ID - no room creation needed
    onUserSelect({
      id: conversation.id,
      name: conversation.name,
      username: conversation.username,
      email: conversation.email || "",
      avatar: conversation.avatar,
      isOnline: conversation.isOnline,
      lastSeen: conversation.lastSeen,
      timestamp: conversation.timestamp,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center px-4">
          <p className="text-sm">
            {searchQuery
              ? "No users found. Try a different search."
              : "No conversations yet. Start chatting with someone!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto custom-scroll">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => handleUserClick(conversation)}
            className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors text-left"
          >
            <div className="relative h-9 w-9 flex-shrink-0">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-gradient-to-br from-[#6c3f79] via-[#995a98] to-[#6c3f79]">
                {conversation.avatar && conversation.avatar !== "/profile.jpg" && !conversation.avatar.includes("profile.jpg") ? (
                  <Image
                    src={conversation.avatar.startsWith('http') 
                      ? conversation.avatar 
                      : `${apiBase}${conversation.avatar?.startsWith('/') ? conversation.avatar?.slice(1) : conversation.avatar}`}
                    alt={conversation.name}
                    width={36}
                    height={36}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-semibold">
                    {conversation.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#06133f] rounded-full z-10 ${conversation.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {conversation.name}
                </p>
                {conversation.timestamp && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {conversation.timestamp}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1">
                  {conversation.lastMessage}
                </p>
                {conversation.unreadCount > 0 && (
                  <div className="bg-[#ff4500] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0 font-medium">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageUserList;


