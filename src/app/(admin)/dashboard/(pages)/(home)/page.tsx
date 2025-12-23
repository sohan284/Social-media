"use client";

import { useMemo } from "react";
import Image from "next/image";
import { PieChart } from "@/components/PieChart";
import { LineChart } from "@/components/LineChart";
import { Column, DataTable } from "@/components/DataTable";
import { useGetDashboardAnalyticsQuery } from "@/store/dashboardApi";
import { getApiBaseUrl } from "@/lib/utils";

interface PostData {
  postHead: string;
  postDate: string;
  totalLikes: string;
  user_name: string;
  avatar?: string;
}

export default function AdminDashboardHome() {
  const { data: analyticsData, isLoading, isError } = useGetDashboardAnalyticsQuery();
  
  // Format date helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Format number helper
  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Get image URL helper
  const getImageUrl = (image: string | undefined) => {
    if (!image) return "/sheep.jpg";
    if (image.startsWith("http")) return image;
    const baseUrl = getApiBaseUrl();
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = image.startsWith("/") ? image.slice(1) : image;
    return `${cleanBase}/${cleanPath}`;
  };

  // Get user initials helper
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Transform top posts to table data
  const postData: PostData[] = useMemo(() => {
    if (!analyticsData?.data?.top_posts) return [];
    
    return analyticsData.data.top_posts.map((post) => {
      // Extract avatar URL - handle different possible structures
      let avatarUrl: string | undefined;
      if (typeof post.avatar === 'string') {
        avatarUrl = post.avatar;
      } else if (post.author?.avatar && typeof post.author.avatar === 'string') {
        avatarUrl = post.author.avatar;
      } else if (post.media && Array.isArray(post.media) && post.media[0] && typeof post.media[0] === 'string') {
        avatarUrl = post.media[0];
      }
      
      return {
        postHead: post.title || "Untitled Post",
        postDate: formatDate(post.created_at),
        totalLikes: formatNumber(post.likes_count),
        user_name: post.user_name || post.author?.username || post.username || "Unknown",
        avatar: avatarUrl,
      };
    });
  }, [analyticsData]);
  const postColumns: Column<PostData>[] = [
    {
      header: 'Avatar',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          {row.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={getImageUrl(row.avatar)}
                alt={row.user_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#6B83FA] flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials(row.user_name)}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Post Head',
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.postHead}>
          {row.postHead}
        </div>
      )
    },
    {
      header: 'Username',
      accessor: (row) => row.user_name
    },
    {
      header: 'Post Date',
      accessor: (row) => row.postDate
    },
    {
      header: 'Total Likes',
      accessor: (row) => row.totalLikes
    },
  ];

  return (
    <div className="space-y-10">

     

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-white/60">Loading dashboard analytics...</div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-400">Failed to load dashboard analytics</div>
        </div>
      ) : analyticsData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 space-y-10 sm:gap-10 overflow-y-auto">
          {/* KPI CARDS - Left Column */}
          <div className="grid grid-cols-1 gap-6">
            {[
              { 
                title: "Total Users", 
                count: `${analyticsData.data.total_users.toLocaleString()} users`,
                color: "#6B83FA"
              },
              { 
                title: "Total Posts", 
                count: `${analyticsData.data.total_posts.toLocaleString()} posts`,
                color: "#517EE0"
              },
              { 
                title: "New Signup (7d)", 
                count: `${analyticsData.data.recent_activity.new_users_7d.toLocaleString()} users`,
                color: "#ff4db8"
              },
              { 
                title: "Total Communities", 
                count: `${analyticsData.data.total_communities.toLocaleString()} communities`,
                color: "#10B981"
              },
            ].map((item) => (
              <div key={item.title} className="  rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm py-6 md:py-0 flex items-center justify-center">
               <div>
               <h3 className="mb-2 text-center text-white text-sm font-medium">{item.title}</h3>
                <div className="flex items-center justify-center">
                  <p className="text-2xl font-semibold text-white">{item.count}</p>
                </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-3 space-y-10">
            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LINE CHART - Activity Timeline */}
              <div className="h-fit w-full border border-[#9BD4F0] rounded-xl p-6 bg-black/30 backdrop-blur-sm  ">
                <h1 className="text-center text-2xl font-semibold mb-4 text-white">Recent Activity (Last 7 Days)</h1>
                <LineChart
                  data={analyticsData.data.activity_timeline}
                  title=""
                />
              </div>

              {/* PIE CHART - Post Status Distribution */}
              <div className="h-fit w-full border border-[#9BD4F0] rounded-xl p-6 bg-black/30 backdrop-blur-sm">
                <h1 className="text-center text-2xl font-semibold mb-4 text-white">Post Status Distribution</h1>
                <PieChart
                  data={{
                    labels: ['Approved', 'Rejected'],
                    values: [
                      analyticsData.data.post_status.approved,
                      analyticsData.data.post_status.rejected,
                    ],
                    colors: ['#387135', '#B53939'],
                  }}
                />
              </div>
            </div>

            {/* BAR CHART - Post Stats */}
            {/* <div className="h-fit w-full border border-[#9BD4F0] rounded-xl p-6">
              <h1 className="text-center text-2xl font-semibold mb-4 text-white">Post Status Breakdown</h1>
              <BarChart
                approved={analyticsData.data.post_status.approved}
                rejected={analyticsData.data.post_status.rejected}
              />
            </div> */}

            {/* TOP POSTS TABLE */}
            <DataTable 
              title="Top 10 Most Liked Posts" 
              columns={postColumns} 
              data={postData} 
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
