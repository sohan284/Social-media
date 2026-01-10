"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { CustomTable, Column } from "@/components/admin/CustomTable";
import { useGetAdminAllConversationsQuery, useGetAdminConversationMessagesQuery, AdminConversation } from "@/store/chatApi";
import { getApiBaseUrl } from "@/lib/utils";
import { IoPersonOutline } from "react-icons/io5";
import { MessageSquare, Users } from "lucide-react";
import ConversationMessagesModal from "./ConversationMessagesModal";
import { TableFilters } from "@/components/admin/TableFilters";
import { SearchFilter } from "@/components/admin/SearchFilter";

export default function ConversationsManagementTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [conversationTypeFilter, setConversationTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetAdminAllConversationsQuery({
    page: currentPage,
    limit: pageSize,
    type: conversationTypeFilter === "all" ? undefined : conversationTypeFilter,
    search: searchQuery.trim() || undefined,
  });

  // Get messages for selected conversation using admin endpoint
  const { data: messagesData, isLoading: isLoadingMessages } = useGetAdminConversationMessagesQuery(
    {
      type: selectedConversation?.type || 'direct',
      user1_id: selectedConversation?.type === 'direct' ? selectedConversation.user1?.id : undefined,
      user2_id: selectedConversation?.type === 'direct' ? selectedConversation.user2?.id : undefined,
      room_id: selectedConversation?.type === 'room' ? selectedConversation.room_id : undefined,
    },
    { skip: !selectedConversation || !isModalOpen }
  );

  const conversations = useMemo(() => {
    if (!data) return [];
    // Handle paginated response structure
    if (data.results?.data && Array.isArray(data.results.data)) {
      return data.results.data;
    }
    // Fallback to direct data array
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }, [data]);

  // Extract pagination info
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = data?.next !== null && data?.next !== undefined;
  const hasPrevious = data?.previous !== null && data?.previous !== undefined;

  const getImageUrl = (image: string | undefined) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.startsWith("/") ? image.slice(1) : image;
    return `${cleanBase}/${cleanPath}`;
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const handleConversationClick = (conversation: AdminConversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConversation(null);
  };

  const getMessages = () => {
    return messagesData?.data || messagesData?.messages || [];
  };

  const getModalTitle = () => {
    if (!selectedConversation) return "Messages";
    if (selectedConversation.type === "direct") {
      const user1Name = selectedConversation.user1?.display_name || selectedConversation.user1?.username || "User 1";
      const user2Name = selectedConversation.user2?.display_name || selectedConversation.user2?.username || "User 2";
      return `Direct Messages: ${user1Name} & ${user2Name}`;
    } else {
      return `Room Messages: ${selectedConversation.name || "Unnamed Room"}`;
    }
  };

  type ConversationRow = AdminConversation;

  const columns: Column<ConversationRow>[] = [
    {
      header: "Type",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.type === "direct" ? (
            <>
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Direct</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm">Room</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Participants",
      accessor: (row) => {
        if (row.type === "direct") {
          const user1 = row.user1;
          const user2 = row.user2;
          const user1Name = user1?.display_name || user1?.username || "User 1";
          const user2Name = user2?.display_name || user2?.username || "User 2";
          const user1Avatar = getImageUrl(user1?.avatar);
          const user2Avatar = getImageUrl(user2?.avatar);

          return (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {user1Avatar ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                    <Image
                      src={user1Avatar}
                      alt={user1Name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#6B83FA] flex items-center justify-center text-white font-semibold text-xs border border-white/20">
                    {getUserInitials(user1Name)}
                  </div>
                )}
                {user2Avatar ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                    <Image
                      src={user2Avatar}
                      alt={user2Name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-semibold text-xs border border-white/20">
                    {getUserInitials(user2Name)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white">{user1Name}</span>
                <span className="text-xs text-white/60">{user2Name}</span>
              </div>
            </div>
          );
        } else {
          const participantCount = row.participants?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white">
                {row.name || "Unnamed Room"} ({participantCount} {participantCount === 1 ? "member" : "members"})
              </span>
            </div>
          );
        }
      },
    },
    {
      header: "Last Message",
      accessor: (row) => {
        const lastMessage = row.last_message;
        if (!lastMessage) return <span className="text-white/60 text-sm">No messages</span>;
        
        const content = lastMessage.content || "(No content)";
        const truncated = content.length > 50 ? content.substring(0, 50) + "..." : content;
        return (
          <div className="max-w-xs">
            <p className="text-sm text-white truncate" title={content}>
              {truncated}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {lastMessage.sender?.display_name || lastMessage.sender?.username || "Unknown"}
            </p>
          </div>
        );
      },
    },
    {
      header: "Message Count",
      accessor: (row) => (
        <span className="text-white">{row.message_count || 0}</span>
      ),
    },
    {
      header: "Last Activity",
      accessor: (row) => (
        <span className="text-white/70 text-sm">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  const conversationTypeFilterOptions = [
    { value: "all", label: "All" },
    { value: "direct", label: "Direct Messages" },
    { value: "room", label: "Room Messages" },
  ];

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setPageSize(limit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      <CustomTable
        title="All Conversations"
        description="View and manage all user-to-user and room conversations"
        isLoading={isLoading}
        filters={
          <>
            <TableFilters
              filters={[
                {
                  type: "select",
                  key: "type",
                  label: "Type",
                  options: conversationTypeFilterOptions,
                  value: conversationTypeFilter,
                  onChange: (value) => {
                    setConversationTypeFilter(value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  },
                },
              ]}
            />
            <SearchFilter
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              placeholder="Search by name or email..."
              label="Search"
            />
          </>
        }
        columns={columns}
        data={conversations}
        emptyMessage="No conversations found"
        isError={isError}
        errorMessage="Failed to load conversations. Please try again later"
        onRowClick={handleConversationClick}
        disablePagination={true}
        serverPagination={{
          totalCount,
          currentPage,
          pageSize,
          hasNext,
          hasPrevious,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
          getPageNumbers,
          handlePreviousPage,
          handleNextPage,
        }}
      />

      <ConversationMessagesModal
        open={isModalOpen}
        onClose={handleCloseModal}
        messages={getMessages()}
        conversationType={selectedConversation?.type || "direct"}
        title={getModalTitle()}
        isLoading={isLoadingMessages}
      />
    </div>
  );
}

