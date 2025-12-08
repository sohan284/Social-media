"use client";
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  useGetPopularCommunitiesQuery, 
  useJoinCommunityMutation, 
  useLeaveCommunityMutation,
  CommunityItem
} from '@/store/communityApi';
import { useGetCommunityPostsQuery } from '@/store/postApi';
import { useGetCurrentUserProfileQuery } from '@/store/authApi';
import { FiUsers, FiSearch, FiFilter, FiUserPlus, FiUserMinus, FiFileText, FiArrowLeft } from 'react-icons/fi';
import FriendsIcon from '../../Icons/FriendsIcon';
import { toast } from 'sonner';
import Post from '../Main/Post/Post';
import CommunityCard from '../../Shared/CommunityCard/CommunityCard';

const Communities = () => {
  const router = useRouter();
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: communitiesResponse, isLoading, isError, refetch } = useGetPopularCommunitiesQuery();
  const { data: profileResponse } = useGetCurrentUserProfileQuery();
  const profile = profileResponse?.data;
  const { data: postsResponse, isLoading: isLoadingPosts } = useGetCommunityPostsQuery(selectedCommunity, {
    skip: !selectedCommunity,
  });
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();

  const allCommunities = useMemo(() => {
    if (!communitiesResponse) return [];
    const data = communitiesResponse.results?.data ?? communitiesResponse.data ?? [];
    return Array.isArray(data) ? data : [];
  }, [communitiesResponse]);

  // Filter to only show public communities
  const communities = useMemo(() => {
    return allCommunities.filter((c: CommunityItem) => c.visibility === 'public');
  }, [allCommunities]);

  const posts = useMemo(() => {
    if (!postsResponse) return [];
    return (
      postsResponse.data ??
      postsResponse.results?.data ??
      postsResponse.posts ??
      []
    );
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
      toast.success('Successfully joined community!');
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
      {filteredCommunities.map((community: CommunityItem) => (
        <CommunityCard
          key={community.id}
          community={community}
          variant="grid"
          onCardClick={() => setSelectedCommunity(community.name || '')}
          showCreatedBy={true}
          formatDate={formatDate}
          actions={
            community.name ? (
              <div className="flex gap-2">
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
                    if (community.is_member) {
                      handleLeave(community.name!);
                    } else {
                      handleJoin(community.name!);
                    }
                  }}
                  disabled={isJoining || isLeaving}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                    community.is_member
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  } ${(isJoining || isLeaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center cursor-pointer justify-center gap-2">
                    {community.is_member ? (
                      <>
                        <FiUserMinus className="w-4 h-4 text-red-500" />
                        <span className="text-red-500">Leave</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Join</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            ) : undefined
          }
        />
      ))}
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
                            disabled={isJoining || isLeaving}
                            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                              community.is_member
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                            } ${(isJoining || isLeaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {community.is_member ? 'Leave Community' : 'Join Community'}
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
                            <h3 className='text-white text-sm font-semibold truncate'>{community.title || community.name}</h3>
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
                          className='text-white px-4 py-2 hover:text-slate-400 duration-300 ease-in-out cursor-pointer text-sm'
                        >
                          {community.is_member ? 'Joined' : 'Join'}
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
