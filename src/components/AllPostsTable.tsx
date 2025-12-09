export default function AllPostsTable() {
  const rows = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: "Post Head",
    date: "01.12.25",
    approved: "Approved",
    rejected: "Rejected",
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg border-white/20">
      <h2 className="text-2xl font-semibold text-center">All Posts</h2>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-white/10">
              <th className="px-4 py-3">SL</th>
              <th className="px-4 py-3">Post Head</th>
              <th className="px-4 py-3">Post Date</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Rejected</th>
              <th className="px-4 py-3 text-center">Edit/Delete</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => (
              <tr
                key={item.id}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="px-4 py-3">{item.id}.</td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{item.date}</td>
                <td className="px-4 py-3 text-green-300">{item.approved}</td>
                <td className="px-4 py-3 text-red-300">{item.rejected}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-3">
                    {/* Edit Icon */}
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M21.7 7.3l-5-5c-.4-.4-1-.4-1.4 0l-12 12c-.1.1-.2.3-.2.4l-1 6c-.1.5.4 1 .9.9l6-1c.1 0 .3-.1.4-.2l12-12c.4-.4.4-1 0-1.4zM7.6 19.2l-3.5.6.6-3.5L14 6l2.9 2.9-9.3 9.3z" />
                      </svg>
                    </button>

                    {/* Delete Icon */}
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
