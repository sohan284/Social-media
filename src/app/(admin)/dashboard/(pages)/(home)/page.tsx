import { BarChart } from "@/components/BarChart";
import { Column, DataTable } from "@/components/DataTable";
import { SlidersHorizontal } from "lucide-react"


interface PostData {
  postHead: string;
  postDate: string;
  totalLikes: string;
  totalShare: string;
}

export default function AdminDashboardHome() {
  const postColumns: Column<PostData>[] = [
    {
      header: 'SL',
      accessor: (row, index) => index + 1
    },
    {
      header: 'Post Head',
      accessor: (row) => row.postHead
    },
    {
      header: 'Post Date',
      accessor: (row) => row.postDate
    },
    {
      header: 'Total Likes',
      accessor: (row) => row.totalLikes
    },
    {
      header: 'Total Share',
      accessor: (row) => row.totalShare
    }
  ];

  // Your post data with proper typing
  const postData: PostData[] = [
    { postHead: 'Post Head', postDate: '01.12.25', totalLikes: '10K', totalShare: '200' },
    { postHead: 'Post Head', postDate: '01.12.25', totalLikes: '10K', totalShare: '200' },
    { postHead: 'Post Head', postDate: '01.12.25', totalLikes: '10K', totalShare: '200' },
    { postHead: 'Post Head', postDate: '01.12.25', totalLikes: '10K', totalShare: '200' }
  ];

  return (
    <div className="space-y-10">

      {/* WELCOME SECTION */}
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-xl opacity-70">Hi Mr.man</h2>
        <h1 className="text-4xl font-semibold">Welcome Back</h1>
      </div>
      <div>    
        <button className="bg-[#6B83FA] flex items-center px-8 py-4 rounded-[20px] backdrop-blur-lg text-lg">
          <SlidersHorizontal className="w-5 h-5 mr-2 inline-block" />
          <span>Customize Dashboard</span>
        </button>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { title: "Active Users", percent: 50, count: "123K users" },
            { title: "Total Users", percent: 70, count: "1.2M users" },
            { title: "New Signup", percent: 20, count: "12,345 users" },
          ].map((item) => (
            <div key={item.title} className=" p-6 rounded-xl border border-white/20">
              <h3 className="mb-4 text-center">{item.title}</h3>

              <div className="flex items-center flex-col space-y-4">
                {/* Circle Progress Mock */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full">
                    <circle cx="40" cy="40" r="32" stroke="#ffffff40" strokeWidth="8" fill="none" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#ff4db8"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={200}
                      strokeDashoffset={200 - (200 * item.percent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
                    {item.percent}%
                  </span>
                </div>
                <p className="opacity-70">{item.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-10">
              {/* ALL POSTS TABLE */}
            
              <DataTable 
                title="All Posts" 
                columns={postColumns} 
                data={postData} 
              />

            {/* POST STATS GRAPH MOCK */}
            <div className="h-fit w-full border border-[#9BD4F0] rounded-xl p-6">
              <h1 className="text-center text-2xl font-semibold mb-4">Post Stats</h1>
              <BarChart />
            </div>
        </div>
      </div>
    </div>
  );
}
