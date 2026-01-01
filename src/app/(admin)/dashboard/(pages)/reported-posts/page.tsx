import ReportedPostsTable from "@/components/ReportedPostsTable";

export default function ReportedPosts() {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">All Reports</h1>
        <p className="text-white/60 mt-2">Manage and review posts and users that have been reported</p>
      </div>

      {/* TABLE */}
      <ReportedPostsTable />
    </div>
  );
}

