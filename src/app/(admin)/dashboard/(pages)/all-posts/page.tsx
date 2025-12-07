import AllPostsTable from "@/components/AllPostsTable";
import { BarChart } from "@/components/BarChart";
import { Column, DataTable } from "@/components/DataTable";
import { SlidersHorizontal } from "lucide-react"



export default function AllPosts() {

  return (
    <div className="space-y-10">

      
      {/* WELCOME SECTION */}
        <div>
        <h1 className="text-4xl font-semibold">All Posts</h1>
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

        <div className="col-span-3">
          <AllPostsTable />
        </div>
      </div>
    </div>
  );
}
