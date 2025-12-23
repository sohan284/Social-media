import AllPostsTable from "@/components/AllPostsTable";
import { BarChart } from "@/components/BarChart";
import { Column, DataTable } from "@/components/DataTable";
import { SlidersHorizontal } from "lucide-react"



export default function AllPosts() {

  return (
    <div className="space-y-10">

      
      {/* WELCOME SECTION */}
    


      <div className="grid  gap-10">
        {/* KPI CARDS */}
  
        <div className="">
          <AllPostsTable />
        </div>
      </div>
    </div>
  );
}
