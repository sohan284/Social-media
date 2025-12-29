import { baseApi } from "./baseApi";

export interface ChatRoom {
  id: number | string;
  name?: string;
  participants?: ChatUser[];
  admins?: ChatUser[];
  last_message?: ChatMessage;
  unread_count?: number;
  other_participant?: ChatUser;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ChatUser {
  id: number | string;
  username?: string;
  email?: string;
  display_name?: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: number | string;
  room?: number | string;
  room_id?: number | string;
  sender?: ChatUser;
  sender_id?: number | string;
  sender_username?: string;
  receiver?: ChatUser;
  receiver_id?: number | string;
  content?: string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
}

export interface GetChatRoomsResponse {
  data?: ChatRoom[];
  results?: ChatRoom[];
  rooms?: ChatRoom[];
  [key: string]: unknown;
}

export interface CreateChatRoomRequest {
  participant_id?: number | string;
  name?: string;
  member_ids?: (number | string)[];
  [key: string]: unknown;
}

export interface CreateChatRoomResponse {
  success?: boolean;
  message?: string;
  data?: ChatRoom;
  room?: ChatRoom;
  id?: number | string;
  [key: string]: unknown;
}

export interface GetMessagesResponse {
  data?: ChatMessage[];
  results?: {
    data?: ChatMessage[];
  };
  messages?: ChatMessage[];
  [key: string]: unknown;
}

export interface SendMessageRequest {
  content: string;
  room?: number | string;
  receiver_id?: number | string;
}

export interface SendMessageResponse {
  success?: boolean;
  message?: string;
  data?: ChatMessage;
  [key: string]: unknown;
}

export interface GetChatUsersResponse {
  data?: ChatUser[];
  results?: {
    data?: ChatUser[];
  };
  users?: ChatUser[];
  [key: string]: unknown;
}

export interface ConversationItem {
  user?: ChatUser;
  last_message?: ChatMessage;
  unread_count?: number;
  last_message_time?: string;
  i_blocked_them?: boolean;
  they_blocked_me?: boolean;
}

export interface GetConversationsListResponse {
  data?: ConversationItem[];
  results?: {
    data?: ConversationItem[];
  };
  conversations?: ConversationItem[];
  [key: string]: unknown;
}

export interface SearchChatUsersResponse {
  data?: ChatUser[];
  results?: {
    data?: ChatUser[];
  };
  users?: ChatUser[];
  [key: string]: unknown;
}

export interface BlockedUser {
  id: number | string;
  blocked_user?: ChatUser;
  blocked_user_id?: number | string;
  created_at?: string;
}

export interface BlockUserResponse {
  success?: boolean;
  message?: string;
  data?: BlockedUser;
  error?: string;
}

export interface BlockedUsersListResponse {
  success?: boolean;
  data?: BlockedUser[];
}

export interface UserReport {
  id: number | string;
  reporter?: ChatUser;
  reported_user?: ChatUser;
  reported_user_id?: number | string;
  reason?: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_account' | 'other';
  description?: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at?: string;
}

export interface ReportUserRequest {
  reported_user: number | string;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_account' | 'other';
  description?: string;
}

export interface ReportUserResponse {
  success?: boolean;
  message?: string;
  data?: UserReport;
  error?: string | Record<string, unknown>;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<GetChatRoomsResponse, void>({
      query: () => ({
        url: "/api/chat/rooms/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...(result.data || result.results || result.rooms || []).map(
                (room: ChatRoom) => ({ type: "ChatRooms" as const, id: room.id })
              ),
              { type: "ChatRooms", id: "LIST" },
            ]
          : [{ type: "ChatRooms", id: "LIST" }],
    }),
    createChatRoom: builder.mutation<CreateChatRoomResponse, CreateChatRoomRequest>({
      query: (data) => ({
        url: "/api/chat/rooms/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ChatRooms"],
    }),
    getRoomMessages: builder.query<GetMessagesResponse, number | string>({
      query: (roomId) => ({
        url: `/api/chat/rooms/${roomId}/messages/`,
        method: "GET",
      }),
      providesTags: (result, error, roomId) => [{ type: "Messages", id: roomId }],
    }),
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: `/api/chat/rooms/${data.room}/send_message/`,
        method: "POST",
        body: { content: data.content },
      }),
      async onQueryStarted({ room }, { dispatch, queryFulfilled }) {
        if (!room) return;
        
        try {
          await queryFulfilled;
          // Invalidate to refetch with the new message
          dispatch(chatApi.util.invalidateTags([{ type: "Messages", id: room }]));
          dispatch(chatApi.util.invalidateTags(["ChatRooms"]));
        } catch {
          // Error handling
        }
      },
    }),
    updateChatRoom: builder.mutation<CreateChatRoomResponse, { id: number | string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/chat/rooms/${id}/`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["ChatRooms"],
    }),
    deleteChatRoom: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: `/api/chat/rooms/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatRooms"],
    }),
    getChatUsers: builder.query<GetChatUsersResponse, void>({
      query: () => ({
        url: "/api/chat/users/",
        method: "GET",
      }),
      providesTags: ["ChatUsers"],
    }),
    searchChatUsers: builder.query<SearchChatUsersResponse, string>({
      query: (query) => ({
        url: `/api/chat/users/search/?q=${encodeURIComponent(query)}`,
        method: "GET",
      }),
      providesTags: ["ChatUsers"],
    }),
    // Direct messaging endpoints
    sendDirectMessage: builder.mutation<SendMessageResponse, { receiver_id: number | string; content: string }>({
      query: (data) => ({
        url: "/api/chat/messages/send/",
        method: "POST",
        body: {
          receiver_id: data.receiver_id,
          content: data.content,
        },
      }),
      async onQueryStarted({ receiver_id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate conversation messages to refetch
          dispatch(chatApi.util.invalidateTags([{ type: "Messages", id: receiver_id }]));
          // Invalidate conversations list so the new conversation appears
          dispatch(chatApi.util.invalidateTags(["Conversations"]));
          // Also invalidate chat users to refresh the list
          dispatch(chatApi.util.invalidateTags(["ChatUsers"]));
        } catch {
          // Error handling
        }
      },
    }),
    getConversation: builder.query<GetMessagesResponse, number | string>({
      query: (userId) => ({
        url: `/api/chat/messages/conversation/?user_id=${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "Messages", id: userId }],
    }),
    getConversationsList: builder.query<GetConversationsListResponse, void>({
      query: () => ({
        url: "/api/chat/messages/conversations/",
        method: "GET",
      }),
      providesTags: ["Conversations"],
    }),
    makeRoomAdmin: builder.mutation<CreateChatRoomResponse, { roomId: number | string; user_id: number | string }>({
      query: ({ roomId, user_id }) => ({
        url: `/api/chat/rooms/${roomId}/make_admin/`,
        method: "POST",
        body: { user_id },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "ChatRooms", id: roomId },
        { type: "ChatRooms", id: "LIST" },
      ],
    }),
    removeRoomMember: builder.mutation<CreateChatRoomResponse, { roomId: number | string; user_id: number | string }>({
      query: ({ roomId, user_id }) => ({
        url: `/api/chat/rooms/${roomId}/remove_member/`,
        method: "POST",
        body: { user_id },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "ChatRooms", id: roomId },
        { type: "ChatRooms", id: "LIST" },
      ],
    }),
    addRoomMembers: builder.mutation<CreateChatRoomResponse, { roomId: number | string; member_ids: (number | string)[] }>({
      query: ({ roomId, member_ids }) => ({
        url: `/api/chat/rooms/${roomId}/add_members/`,
        method: "POST",
        body: { member_ids },
      }),
      invalidatesTags: ["ChatRooms"],
    }),
    // Block and Report endpoints
    blockUser: builder.mutation<BlockUserResponse, { user_id: number | string }>({
      query: (data) => ({
        url: "/api/chat/block/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { user_id }) => [
        "ChatUsers",
        "Conversations",
        "ChatRooms",
        "BlockedUsers",
        { type: "Messages", id: user_id }, // Invalidate conversation to update block status
      ],
    }),
    unblockUser: builder.mutation<{ success?: boolean; message?: string; error?: string }, { user_id: number | string }>({
      query: (data) => ({
        url: "/api/chat/unblock/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { user_id }) => [
        "ChatUsers",
        "Conversations",
        "ChatRooms",
        "BlockedUsers",
        { type: "Messages", id: user_id }, // Invalidate conversation to update block status
      ],
    }),
    getBlockedUsers: builder.query<BlockedUsersListResponse, void>({
      query: () => ({
        url: "/api/chat/blocked-users/",
        method: "GET",
      }),
      providesTags: ["BlockedUsers"],
    }),
    reportUser: builder.mutation<ReportUserResponse, ReportUserRequest>({
      query: (data) => ({
        url: "/api/chat/report/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserReports"],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useCreateChatRoomMutation,
  useGetRoomMessagesQuery,
  useSendMessageMutation,
  useGetChatUsersQuery,
  useSearchChatUsersQuery,
  useSendDirectMessageMutation,
  useGetConversationQuery,
  useGetConversationsListQuery,
  useUpdateChatRoomMutation,
  useDeleteChatRoomMutation,
  useMakeRoomAdminMutation,
  useRemoveRoomMemberMutation,
  useAddRoomMembersMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
  useReportUserMutation,
} = chatApi;
