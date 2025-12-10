"use client";

import { useEffect, useRef, useCallback } from 'react';
import { store } from '@/store/store';
import { chatApi } from '@/store/chatApi';
import { getStoredAccessToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/utils';

type WebSocketMessage = {
  type: string;
  room?: number | string;
  message?: {
    id: number | string;
    room?: number | string;
    sender?: {
      id: number | string;
      username?: string;
      display_name?: string;
      avatar?: string;
      is_online?: boolean;
    };
    content?: string;
    created_at?: string;
    is_read?: boolean;
  };
  [key: string]: unknown;
};

type UseChatWebSocketOptions = {
  enabled?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
};

export const useChatWebSocket = (options: UseChatWebSocketOptions = {}) => {
  const { enabled = true, onMessage, onError } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = getApiBaseUrl();
    const token = getStoredAccessToken();
    
    // Convert HTTP/HTTPS URL to WebSocket URL
    let wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/$/, '');
    
    // Common WebSocket endpoints for chat (try different formats)
    // Format 1: /ws/chat/
    // Format 2: /ws/chat
    // Format 3: /chat/ws/
    const possibleEndpoints = ['/ws/chat/', '/ws/chat', '/chat/ws/', '/chat/ws'];
    
    // Check if URL already contains a WebSocket endpoint
    const hasEndpoint = possibleEndpoints.some(endpoint => wsUrl.includes(endpoint));
    
    if (!hasEndpoint) {
      // Default to /ws/chat/
      wsUrl += '/ws/chat/';
    }
    
    // Add token as query parameter if available
    if (token) {
      const separator = wsUrl.includes('?') ? '&' : '?';
      wsUrl += `${separator}token=${encodeURIComponent(token)}`;
    }
    
    return wsUrl;
  }, []);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'message' || data.message || data.content) {
            const message = data.message || data;
            const roomId = message.room || data.room || (message as { room_id?: number | string }).room_id;

            if (roomId && message.id) {
              // Update the messages cache for the specific room
              store.dispatch(
                chatApi.util.updateQueryData('getRoomMessages', roomId, (draft) => {
                  const messagesData = 
                    draft.data ?? 
                    draft.results?.data ?? 
                    draft.messages ?? 
                    [];

                  // Check if message already exists
                  const messageExists = messagesData.some(
                    (msg: { id: number | string }) => String(msg.id) === String(message.id)
                  );

                  if (!messageExists) {
                    // Ensure message has required fields
                    const formattedMessage = {
                      id: message.id,
                      room: roomId,
                      sender: message.sender || (message as { user?: unknown }).user,
                      content: message.content || message.text || '',
                      created_at: message.created_at || new Date().toISOString(),
                      is_read: message.is_read !== false,
                      ...message,
                    };
                    messagesData.push(formattedMessage);
                  }
                })
              );

              // Invalidate chat rooms to update last message and unread count
              store.dispatch(chatApi.util.invalidateTags(['ChatRooms']));
            }
          }

          // Call custom onMessage handler if provided
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;

        // Attempt to reconnect if enabled and not exceeded max attempts
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
            connect();
          }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [enabled, getWebSocketUrl, onMessage, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    connect,
    disconnect,
  };
};

