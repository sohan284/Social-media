"use client";

import React, { useMemo, useState } from "react";
import { useGetMyCommunitiesQuery, useDeleteCommunityMutation, CommunityItem } from "@/store/communityApi";
import { FaUsers } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CommunityCard from "../../Shared/CommunityCard/CommunityCard";
import ConfirmDialog from "@/components/ConfirmDialog";

const ManageCommunities = () => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<CommunityItem | null>(null);
  const { data: communitiesResponse, isLoading, isError } = useGetMyCommunitiesQuery();
  const [deleteCommunity, { isLoading: isDeleting }] = useDeleteCommunityMutation();

  const communities = useMemo(() => {
    if (!communitiesResponse) return [];
    return (
      communitiesResponse.data ??
      communitiesResponse.results?.data ??
      communitiesResponse.communities ??
      []
    );
  }, [communitiesResponse]);

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

  const handleDeleteClick = (community: CommunityItem) => {
    setCommunityToDelete(community);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!communityToDelete) return;

    const communityName = communityToDelete.name || communityToDelete.id?.toString() || "";
    
    try {
      await deleteCommunity(communityName).unwrap();
      toast.success("Community deleted successfully!", {
        description: `The community "${communityToDelete.title || communityToDelete.name || communityName}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setCommunityToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting community:', error);
      const errorMessage = 
        (error && typeof error === 'object' && 'data' in error && 
         error.data && typeof error.data === 'object' && 
         ('message' in error.data || 'detail' in error.data))
          ? (error.data as { message?: string; detail?: string }).message || 
            (error.data as { message?: string; detail?: string }).detail
          : "Failed to delete community. Please try again.";
      
      toast.error("Error deleting community", {
        description: errorMessage || "Failed to delete community. Please try again.",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCommunityToDelete(null);
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

  const handleCardClick = (community: CommunityItem) => {
    const communityName = community.name || community.id?.toString() || "";
    if (communityName) {
      router.push(`/main/communities?community=${encodeURIComponent(communityName)}`);
    }
  };

  const renderCommunities = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            variant="grid"
            showCreatedBy={false}
            formatDate={formatDate}
            onCardClick={() => handleCardClick(community)}
            actions={
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const communityName = community.name || community.id?.toString() || "";
                    router.push(`/main/edit-community/${encodeURIComponent(communityName)}`);
                  }}
                  className="flex-1 py-2.5 cursor-pointer rounded-lg font-medium transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(community);
                  }}
                  disabled={isDeleting}
                  className={`py-2.5 px-4 cursor-pointer rounded-lg font-medium transition-all bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1220px] mx-auto px-4 py-8 text-white">
      <div className="bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 md:p-10">
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

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Community"
        description={`Are you sure you want to delete "${communityToDelete?.title || communityToDelete?.name || 'this community'}"? This action cannot be undone and will permanently remove the community and all its content.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ManageCommunities;

