import RejectedPostsTable from "@/components/admin/RejectedPostsTable";

export default function RejectedPosts() {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">Rejected Posts</h1>
      </div>

      {/* TABLE */}
      <RejectedPostsTable />
    </div>
  );
}

