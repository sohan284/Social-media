"use client";

import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { GoBell } from "react-icons/go";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  type NotificationItem,
} from "@/store/notificationApi";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown = ({
  isOpen,
  onClose,
}: NotificationDropdownProps) => {
  const { data, isLoading, isError } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  if (!isOpen) return null;

  const notifications =
    data?.data ?? data?.notifications ?? data?.results?.data ?? [];

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      try {
        await markAsRead({ notificationId: notification.id }).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to post if available
    // if (notification.post) {
    //   router.push(`/main/post/${notification.post}`);
    // }

    onClose();
  };

  const getNotificationTitle = (notification: NotificationItem) => {
    if (notification.notification_type === "comment") {
      return `${notification.sender_name ?? "Someone"} commented on your post`;
    }
    return notification.post_title ?? "New notification";
  };

  const getNotificationSubtitle = (notification: NotificationItem) => {
    if (notification.post_title) {
      return `Post: ${notification.post_title}`;
    }
    return "";
  };

  const formatNotificationTime = (isoDate?: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-[#06133f] rounded-lg shadow-2xl border border-gray-700 z-50 animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <GoBell className="text-white" size={16} />
          <h3 className="font-semibold text-white text-sm">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-700 rounded-full text-white transition-colors"
          title="Close"
        >
          <AiOutlineClose size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="h-96 flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full px-4 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse space-y-2">
                  <div className="h-3 w-32 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-xs text-red-400 text-center">
              Failed to load notifications. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-xs text-gray-300 text-center">
              You don&apos;t have any notifications yet.
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-800">
            {notifications.map((notification: NotificationItem) => {
              const isUnread = !notification.is_read;
              return (
                <li
                  key={notification.id}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors flex gap-3 relative
                    ${
                      isUnread
                        ? "bg-gray-800/40 hover:bg-gray-800/70 border-l-2 border-[#ff4500]"
                        : "bg-transparent hover:bg-gray-800/30 opacity-70"
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {isUnread && (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff4500] animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs line-clamp-1 ${
                        isUnread
                          ? "font-semibold text-white"
                          : "font-normal text-gray-400"
                      }`}
                    >
                      {getNotificationTitle(notification)}
                    </p>
                    {getNotificationSubtitle(notification) && (
                      <p
                        className={`text-xs mt-0.5 line-clamp-2 ${
                          isUnread ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {getNotificationSubtitle(notification)}
                      </p>
                    )}
                    {notification.created_at && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;


