import { baseApi } from "./baseApi";

export interface ChatRoom {
  id: number | string;
  name?: string;
  participants?: ChatUser[];
  last_message?: ChatMessage;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ChatUser {
  id: number | string;
  username?: string;
  display_name?: string;
  avatar?: string;
  is_online?: boolean;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: number | string;
  room?: number | string;
  sender?: ChatUser;
  content?: string;
  created_at?: string;
  is_read?: boolean;
  [key: string]: unknown;
}

export interface GetChatRoomsResponse {
  data?: ChatRoom[];
  results?: {
    data?: ChatRoom[];
  };
  rooms?: ChatRoom[];
  [key: string]: unknown;
}

export interface CreateChatRoomRequest {
  participant_id?: number | string;
  name?: string;
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
}

export interface SendMessageResponse {
  success?: boolean;
  message?: string;
  data?: ChatMessage;
  [key: string]: unknown;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<GetChatRoomsResponse, void>({
      query: () => ({
        url: "/api/chat/rooms/",
        method: "GET",
      }),
      providesTags: ["ChatRooms"],
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
        url: `/api/chat/rooms/${data.room}/messages/`,
        method: "POST",
        body: { content: data.content },
      }),
      async onQueryStarted({ room }, { dispatch, queryFulfilled }) {
        if (!room) return;
        
        // Optimistically update the messages cache
        const patchResult = dispatch(
          chatApi.util.updateQueryData("getRoomMessages", room, (draft) => {
            // The new message will be added by the server response
          })
        );
        try {
          const { data } = await queryFulfilled;
          // Invalidate to refetch with the new message
          dispatch(chatApi.util.invalidateTags([{ type: "Messages", id: room }]));
          dispatch(chatApi.util.invalidateTags(["ChatRooms"]));
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useCreateChatRoomMutation,
  useGetRoomMessagesQuery,
  useSendMessageMutation,
} = chatApi;

