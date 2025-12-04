"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useGetMyCommunitiesQuery } from "@/store/communityApi";
import { getApiBaseUrl } from "@/lib/utils";
import { FaGlobe, FaEyeSlash, FaLock, FaUsers, FaFileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

const ManageCommunities = () => {
  const router = useRouter();
  const { data: communitiesResponse, isLoading, isError } = useGetMyCommunitiesQuery();

  const communities = useMemo(() => {
    if (!communitiesResponse) return [];
    return (
      communitiesResponse.data ??
      communitiesResponse.results?.data ??
      communitiesResponse.communities ??
      []
    );
  }, [communitiesResponse]);

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case "public":
        return <FaGlobe className="text-green-400" size={16} />;
      case "restricted":
        return <FaEyeSlash className="text-yellow-400" size={16} />;
      case "private":
        return <FaLock className="text-red-400" size={16} />;
      default:
        return <FaGlobe className="text-green-400" size={16} />;
    }
  };

  const getVisibilityLabel = (visibility?: string) => {
    switch (visibility) {
      case "public":
        return "Public";
      case "restricted":
        return "Restricted";
      case "private":
        return "Private";
      default:
        return "Public";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderLoadingState = () => {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 rounded bg-white/10" />
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="flex gap-4 mt-4">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-4 w-20 rounded bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderErrorState = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load communities</p>
          <p className="text-white/60 text-sm">
            Please try again later or refresh the page.
          </p>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <FaUsers size={32} className="text-white/40" />
            </div>
          </div>
          <p className="text-white text-xl font-semibold mb-2">
            No communities yet
          </p>
          <p className="text-white/60 text-sm mb-6">
            You haven&apos;t created any communities. Start by creating your first community!
          </p>
          <button
            onClick={() => router.push("/main/create-community")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
          >
            Create Community
          </button>
        </div>
      </div>
    );
  };

  const renderCommunities = () => {
    return (
      <div className="space-y-4">
        {communities.map((community) => {
          const apiBase = getApiBaseUrl();
          const iconUrl = community.icon
            ? `${apiBase}${community.icon.startsWith("/") ? community.icon.slice(1) : community.icon}`
            : null;
          const bannerUrl = community.banner
            ? `${apiBase}${community.banner.startsWith("/") ? community.banner.slice(1) : community.banner}`
            : null;

          return (
            <div
              key={community.id}
              className="bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden hover:border-white/30 transition-all duration-300"
            >
              {/* Banner */}
              {bannerUrl && (
                <div className="relative w-full h-32">
                  <Image
                    src={bannerUrl}
                    alt={`${community.name} banner`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  {iconUrl ? (
                    <div className="relative h-16 w-16 rounded-full border-2 border-white/20 flex-shrink-0 overflow-hidden">
                      <Image
                        src={iconUrl}
                        alt={community.name || "Community icon"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {community.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-1 truncate">
                          {community.name || "Unnamed Community"}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getVisibilityIcon(community.visibility)}
                          <span className="text-sm text-white/60">
                            {getVisibilityLabel(community.visibility)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {community.description && (
                      <p className="text-sm text-white/80 mb-4 line-clamp-2">
                        {community.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <FaUsers size={14} />
                        <span>
                          {community.members_count || 0} member
                          {(community.members_count || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaFileAlt size={14} />
                        <span>
                          {community.posts_count || 0} post
                          {(community.posts_count || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {community.created_at && (
                        <div className="text-xs text-white/50">
                          Created {formatDate(community.created_at)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          // Navigate to community page or edit page
                          router.push(`/main/community/${community.id}`);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-sm font-medium transition-colors"
                      >
                        View Community
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to edit community page using community name
                          const communityName = community.name || community.id?.toString() || "";
                          router.push(`/main/edit-community/${encodeURIComponent(communityName)}`);
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-2 md:px-4 xl:px-10 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Communities</h1>
        <p className="text-white/60 text-sm">
          View and manage all communities you&apos;ve created
        </p>
      </div>

      {isLoading && renderLoadingState()}
      {isError && renderErrorState()}
      {!isLoading && !isError && communities.length === 0 && renderEmptyState()}
      {!isLoading && !isError && communities.length > 0 && renderCommunities()}
    </div>
  );
};

export default ManageCommunities;

