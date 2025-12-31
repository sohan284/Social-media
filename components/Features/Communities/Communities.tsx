"use client";
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  useGetPopularCommunitiesQuery, 
  useJoinCommunityMutation, 
  useLeaveCommunityMutation,
  useCancelJoinRequestMutation,
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  CommunityItem
} from '@/store/communityApi';
import { useGetCommunityPostsQuery } from '@/store/postApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { FiUsers, FiSearch, FiFilter, FiUserPlus, FiUserMinus, FiFileText, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import FriendsIcon from '../../Icons/FriendsIcon';
import { toast } from 'sonner';
import Post from '../Main/Post/Post';
import CommunityCard from '../../Shared/CommunityCard/CommunityCard';
import CreatePost from '../CreatePost/CreatePost';

const Communities = () => {
  const router = useRouter();
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: communitiesResponse, isLoading, isError, refetch } = useGetPopularCommunitiesQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;
  const { data: postsResponse, isLoading: isLoadingPosts, refetch: refetchPosts } = useGetCommunityPostsQuery(selectedCommunity, {
    skip: !selectedCommunity,
  });
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();
  const [cancelJoinRequest, { isLoading: isCanceling }] = useCancelJoinRequestMutation();
  const { data: invitationsResponse } = useGetInvitationsQuery();
  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();

  const allCommunities = useMemo(() => {
    if (!communitiesResponse) return [];
    const data = communitiesResponse.results?.data ?? communitiesResponse.data ?? [];
    return Array.isArray(data) ? data : [];
  }, [communitiesResponse]);

  // Get pending invitations
  const pendingInvitations = useMemo(() => {
    if (!invitationsResponse) return [];
    const data = invitationsResponse.data ?? invitationsResponse.results ?? [];
    return Array.isArray(data) ? data.filter((inv: { status?: string }) => inv.status === 'pending') : [];
  }, [invitationsResponse]);

  // Create a map of community name to invitation ID
  const invitationMap = useMemo(() => {
    const map: Record<string, { id: number | string; community_name?: string }> = {};
    pendingInvitations.forEach((inv: { community_name?: string; community?: string | number; id?: number | string }) => {
      const commName = inv.community_name || String(inv.community);
      if (commName && inv.id) {
        map[commName] = { id: inv.id, community_name: commName };
      }
    });
    return map;
  }, [pendingInvitations]);

  // Show all communities user can view (public, restricted, private communities user is member of, or has pending invitation)
  const communities = useMemo(() => {
    return allCommunities.filter((c: CommunityItem) => {
      // Show public and restricted communities (everyone can view)
      if (c.visibility === 'public' || c.visibility === 'restricted') {
        return true;
      }
      // Show private communities if user is a member OR has pending invitation
      if (c.visibility === 'private') {
        const hasInvitation = (c as { user_has_pending_invitation?: boolean }).user_has_pending_invitation || 
                              invitationMap[c.name || ''] !== undefined;
        return c.is_member === true || hasInvitation;
      }
      return false;
    });
  }, [allCommunities, invitationMap]);

  const posts = useMemo(() => {
    if (!postsResponse) return [];
    
    // Handle different response structures
    if (Array.isArray(postsResponse.data)) {
      return postsResponse.data;
    }
    if (Array.isArray(postsResponse.posts)) {
      return postsResponse.posts;
    }
    if (postsResponse.results) {
      if (Array.isArray(postsResponse.results)) {
        return postsResponse.results;
      }
      if (postsResponse.results.data && Array.isArray(postsResponse.results.data)) {
        return postsResponse.results.data;
      }
    }
    
    return [];
  }, [postsResponse]);

  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return communities;
    const query = searchQuery.toLowerCase();
    return communities.filter((community: CommunityItem) => 
      community.name?.toLowerCase().includes(query) ||
      community.title?.toLowerCase().includes(query) ||
      community.description?.toLowerCase().includes(query)
    );
  }, [communities, searchQuery]);

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

  const handleJoin = async (communityName: string) => {
    try {
      await joinCommunity(communityName).unwrap();
      refetch();
      
      // Check if it's a join request or direct join
      const community = allCommunities.find((c: CommunityItem) => c.name === communityName);
      if (community?.visibility === 'public') {
        toast.success('Successfully joined community!');
      } else {
        toast.success('Join request sent! Waiting for approval.');
      }
    } catch (error: unknown) {
      console.error('Failed to join community:', error);
      const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || 
                          (error as { data?: { error?: string; message?: string } })?.data?.message || 
                          'An error occurred';
      toast.error('Failed to join community', {
        description: errorMessage,
      });
    }
  };

  const handleLeave = async (communityName: string) => {
    try {
      await leaveCommunity(communityName).unwrap();
      refetch();
      toast.success('Successfully left community!');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || 
                          (error as { data?: { error?: string; message?: string } })?.data?.message || 
                          'An error occurred';
      toast.error('Failed to leave community', {
        description: errorMessage,
      });
    }
  };

  const handleCancelRequest = async (communityName: string) => {
    try {
      await cancelJoinRequest(communityName).unwrap();
      refetch();
      toast.success('Join request cancelled successfully!');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || 
                          (error as { data?: { error?: string; message?: string } })?.data?.message || 
                          'An error occurred';
      toast.error('Failed to cancel join request', {
        description: errorMessage,
      });
    }
  };

  const handleAcceptInvitation = async (invitationId: number | string) => {
    try {
      await acceptInvitation(invitationId).unwrap();
      refetch();
      toast.success('Invitation accepted! You are now a member.');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || 
                          (error as { data?: { error?: string; message?: string } })?.data?.message || 
                          'An error occurred';
      toast.error('Failed to accept invitation', {
        description: errorMessage,
      });
    }
  };

  const handleRejectInvitation = async (invitationId: number | string) => {
    try {
      await rejectInvitation(invitationId).unwrap();
      refetch();
      toast.success('Invitation declined');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || 
                          (error as { data?: { error?: string; message?: string } })?.data?.message || 
                          'An error occurred';
      toast.error('Failed to reject invitation', {
        description: errorMessage,
      });
    }
  };

  const renderPosts = () => {
    if (!selectedCommunity) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiFileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Select a community to view posts</p>
            <p className="text-white/40 text-sm mt-2">
              Choose a community from the list below to see its posts
            </p>
          </div>
        </div>
      );
    }

    // Check if user is a member
    const community = communities.find((c: CommunityItem) => c.name === selectedCommunity);
    const isMember = community?.is_member === true;
    const hasPendingRequest = (community as { user_has_pending_request?: boolean })?.user_has_pending_request;

    if (!isMember) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white/5 rounded-lg border border-white/10 p-8 max-w-md">
            <FiFileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Join to View Posts</p>
            <p className="text-white/60 text-sm mb-6">
              You must be a member of this community to view posts.
            </p>
            {hasPendingRequest ? (
              <div className="space-y-3">
                <p className="text-orange-400 text-sm">Your join request is pending approval.</p>
                <button
                  onClick={() => handleCancelRequest(selectedCommunity)}
                  disabled={isCanceling}
                  className="px-6 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Request'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleJoin(selectedCommunity)}
                disabled={isJoining}
                className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 font-bold"
              >
                {isJoining ? 'Joining...' : (community?.visibility === 'public' ? 'Join Community' : 'Request to Join')}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (isLoadingPosts) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse border border-white/10 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="h-3 w-32 rounded bg-white/10" />
              </div>
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-48 rounded bg-white/5" />
            </div>
          ))}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <p className="text-gray-300 text-sm text-center py-12">
          No posts available in this community yet.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={post} profile={profile} />
        ))}
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <div className="h-32 bg-white/10 rounded-lg mb-4" />
            <div className="h-12 w-12 rounded-full bg-white/10 mb-4" />
            <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
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
          <div className="mx-auto mb-4 opacity-50 w-16 h-16">
            <FriendsIcon />
          </div>
          <p className="text-white/60 text-lg">No communities found</p>
          <p className="text-white/40 text-sm mt-2">
            {searchQuery ? 'Try adjusting your search query' : 'Be the first to create a community!'}
          </p>
        </div>
      </div>
    );
  };

  const renderCommunitiesGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCommunities.map((community: CommunityItem) => {
        const isMember = community.is_member === true;
        const hasPendingRequest = (community as { user_has_pending_request?: boolean }).user_has_pending_request;
        const hasPendingInvitation = (community as { user_has_pending_invitation?: boolean }).user_has_pending_invitation || 
                                     invitationMap[community.name || ''] !== undefined;
        const invitationId = invitationMap[community.name || '']?.id;
        
        return (
          <CommunityCard
            key={community.id}
            community={community}
            variant="grid"
            onCardClick={isMember ? () => setSelectedCommunity(community.name || '') : undefined}
            showCreatedBy={true}
            formatDate={formatDate}
            actions={
              community.name ? (
                <div className="flex gap-2">
                  {isMember ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCommunity(community.name!);
                        }}
                        className="flex-1 py-2.5 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        View Posts
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeave(community.name!);
                        }}
                        disabled={isLeaving}
                        className={`flex-1 py-2.5 rounded-lg font-bold transition-all bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 flex items-center justify-center gap-2 ${isLeaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <FiUserMinus className="w-4 h-4" />
                        <span>Leave</span>
                      </button>
                    </>
                  ) : community.visibility === 'private' && hasPendingInvitation && invitationId ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvitation(invitationId);
                        }}
                        disabled={isAccepting || isRejecting}
                        className={`flex-1 py-2.5 rounded-lg font-bold transition-all bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30 flex items-center justify-center gap-2 ${(isAccepting || isRejecting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>{isAccepting ? 'Accepting...' : 'Accept'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectInvitation(invitationId);
                        }}
                        disabled={isAccepting || isRejecting}
                        className={`flex-1 py-2.5 rounded-lg font-bold transition-all bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 flex items-center justify-center gap-2 ${(isAccepting || isRejecting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <FiX className="w-4 h-4" />
                        <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPendingRequest) {
                          handleCancelRequest(community.name!);
                        } else {
                          handleJoin(community.name!);
                        }
                      }}
                      disabled={isJoining || isCanceling}
                      className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                        hasPendingRequest
                          ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 border border-orange-500/30'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30'
                      } ${(isJoining || isCanceling) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-center gap-2`}
                    >
                      {hasPendingRequest ? (
                        <span>{isCanceling ? 'Canceling...' : 'Pending'}</span>
                      ) : (
                        <>
                          <FiUserPlus className="w-4 h-4" />
                          <span>{community.visibility === 'public' ? 'Join' : 'Request to Join'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );

  return (
    <>
      {selectedCommunity ? (
        <div className="mx-auto flex gap-10 pt-6 lg:p-4 text-white">
            {/* Center - Posts */}
            <div className="w-full bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-lg p-4 xl:p-10">
              <div className="border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedCommunity('')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <FiArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <h2 className="text-2xl font-semibold text-white">
                    {communities.find((c: CommunityItem) => c.name === selectedCommunity)?.title || selectedCommunity}
                  </h2>
                </div>
              </div>
              <div className="space-y-6">
                {(() => {
                  const community = communities.find((c: CommunityItem) => c.name === selectedCommunity);
                  if (!community?.id) return null;
                  
                  // Show CreatePost only if user can post
                  // Public: everyone can post
                  // Restricted/Private: only approved members can post
                  const canPost = community.can_post === true || 
                                 (community.visibility === 'public' && community.is_member !== false);
                  
                  if (!canPost) {
                    return (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                        <p className="text-yellow-300 text-sm">
                          {community.visibility === 'restricted' 
                            ? 'You can view posts but need to be an approved member to post in this restricted community.'
                            : 'You must be an approved member to post in this private community.'}
                        </p>
                        {!community.is_member && (
                          <button
                            onClick={() => handleJoin(community.name!)}
                            disabled={isJoining || (community as { user_has_pending_request?: boolean }).user_has_pending_request}
                            className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            {(community as { user_has_pending_request?: boolean }).user_has_pending_request 
                              ? 'Request Pending' 
                              : 'Request to Join'}
                          </button>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <CreatePost 
                      communityId={community.id} 
                      isProfile={true}
                      onSuccess={() => {
                        refetchPosts();
                      }}
                    />
                  );
                })()}
                {renderPosts()}
              </div>
            </div>

            {/* Right Sidebar - Community Details & Popular Communities */}
            <div
              style={{ scrollbarGutter: "stable both-edges" }}
              className="h-[90vh] hidden lg:block rounded-lg w-[500px] sticky top-18 hover:overflow-y-auto overflow-y-hidden custom-scroll"
            >
              <div className="space-y-4">
                {/* Community Details */}
                {(() => {
                  const community = communities.find((c: CommunityItem) => c.name === selectedCommunity);
                  if (!community) return null;
                  
                  const iconUrl = community.icon || community.profile_image
                    ? `${(community.icon || community.profile_image)?.startsWith("/") ? (community.icon || community.profile_image)?.slice(1) : (community.icon || community.profile_image)}`
                    : null;
                  const bannerUrl = community.banner || community.cover_image
                    ? `${(community.banner || community.cover_image)?.startsWith("/") ? (community.banner || community.cover_image)?.slice(1) : (community.banner || community.cover_image)}`
                    : null;

                  return (
                    <div className='bg-[#06133F]/75 backdrop-blur-[17.5px] rounded-2xl'>
                      <div className='relative'>
                        {bannerUrl ? (
                          <div className="relative w-full h-32">
                            <Image src={bannerUrl} alt="Cover Image" fill className='rounded-t-2xl object-cover' unoptimized />
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-2xl" />
                        )}
                      </div>
                      <div className='p-4'>
                        <div className='flex items-center gap-3 mb-4'>
                          {iconUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 -mt-8 bg-[#06133F]/75">
                              <Image src={iconUrl} alt="Community icon" fill className='object-cover' unoptimized />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 -mt-8">
                              <FiUsers className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className='font-semibold text-white'>{community.title || community.name}</h3>
                            <p className='text-sm text-gray-400'>{community.members_count || 0} Members</p>
                          </div>
                        </div>
                        {community.description && (
                          <p className='text-sm text-white/70 mb-4'>{community.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className='text-xs text-gray-400'>Total Posts</p>
                            <p className='text-xs font-bold text-white'>{community.posts_count || 0}</p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-400'>Members</p>
                            <p className='text-xs font-bold text-white'>{community.members_count || 0}</p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-400'>Visibility</p>
                            <p className='text-xs font-bold text-white'>{getVisibilityLabel(community.visibility)}</p>
                          </div>
                          {community.created_by_username && (
                            <div>
                              <p className='text-xs text-gray-400'>Created by</p>
                              <p className='text-xs font-bold text-white truncate'>{community.created_by_username}</p>
                            </div>
                          )}
                        </div>
                        {community.name && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (community.is_member) {
                                handleLeave(community.name!);
                              } else {
                                handleJoin(community.name!);
                              }
                            }}
                            disabled={isJoining || isLeaving || (community as { user_has_pending_request?: boolean }).user_has_pending_request}
                            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                              community.is_member
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : (community as { user_has_pending_request?: boolean }).user_has_pending_request
                                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                            } ${(isJoining || isLeaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {community.is_member 
                              ? 'Leave Community' 
                              : (community as { user_has_pending_request?: boolean }).user_has_pending_request
                              ? 'Request Pending'
                              : community.visibility === 'public' 
                              ? 'Join Community' 
                              : 'Request to Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Popular Communities */}
                <div className='bg-[#06133F]/75 backdrop-blur-[17.5px] py-6 px-4 rounded-2xl space-y-4'>
                  <h1 className='text-white text-lg font-semibold'>Popular Communities</h1>
                  {communities.slice(0, 5).map((community: CommunityItem) => {
                    if (community.name === selectedCommunity) return null;
                    const iconUrl = community.icon || community.profile_image
                      ? `${(community.icon || community.profile_image)?.startsWith("/") ? (community.icon || community.profile_image)?.slice(1) : (community.icon || community.profile_image)}`
                      : null;
                    
                    const formatMembers = (members: number) => {
                      if (members >= 100000) return '100k+';
                      if (members >= 10000) return '10k+';
                      if (members >= 1000) return '1k+';
                      return members.toString();
                    };

                    return (
                      <div key={community.id} className='flex items-center justify-between'>
                        <div 
                          className='flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() => setSelectedCommunity(community.name || '')}
                        >
                          {iconUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <Image src={iconUrl} alt={community.title || community.name || ''} fill className='object-cover' unoptimized />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <FiUsers className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className='text-white text-sm font-semibold truncate max-w-[150px]'>{community.title || community.name}</h3>
                            <p className='text-gray-400 text-xs'>{formatMembers(community.members_count || 0)} Members</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (community.is_member) {
                              handleLeave(community.name!);
                            } else {
                              handleJoin(community.name!);
                            }
                          }}
                          disabled={isJoining || isLeaving || (community as { user_has_pending_request?: boolean }).user_has_pending_request}
                          className={`text-white px-4 py-2 hover:text-slate-400 duration-300 ease-in-out cursor-pointer text-sm ${
                            (isJoining || isLeaving) ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            (community as { user_has_pending_request?: boolean }).user_has_pending_request 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : ''
                          }`}
                        >
                          {community.is_member 
                            ? 'Leave' 
                            : (community as { user_has_pending_request?: boolean }).user_has_pending_request
                            ? 'Pending'
                            : 'Join'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </div>
      ) : (
        <div className="max-w-[1220px] mx-auto px-4 py-8 text-white">
          <div className="bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 md:p-10">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8">
                    <FriendsIcon />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Explore Communities
                </h1>
              </div>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Discover and join communities that match your interests. Connect with like-minded people and share your passions.
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search communities by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/40"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all">
                <FiFilter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>

            {/* Communities Grid */}
            {isLoading && renderLoadingState()}
            {isError && renderErrorState()}
            {!isLoading && !isError && filteredCommunities.length === 0 && renderEmptyState()}
            {!isLoading && !isError && filteredCommunities.length > 0 && renderCommunitiesGrid()}

            {/* Create Community CTA */}
            {!isLoading && !isError && (
              <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl border border-blue-500/30 p-6 md:p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">Want to Create Your Own Community?</h3>
                <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                  Start your own community and bring people together around shared interests, hobbies, or causes.
                </p>
                <button 
                  onClick={() => router.push('/main/create-community')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  Create Community
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Communities;
