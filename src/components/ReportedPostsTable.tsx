"use client";
import { useMemo, useState } from "react";
import { useGetUnifiedReportsQuery, useReviewUnifiedReportMutation, useDeleteUnifiedReportMutation, UnifiedReportItem } from "@/store/postApi";
import { CustomTable, Column } from "@/components/admin/CustomTable";
import { TableFilters } from "@/components/admin/TableFilters";
import { DateFilter, DateRangePreset, DateRange } from "@/components/admin/DateFilter";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { CheckCircle2, XCircle, Eye, Clock, FileText, User } from "lucide-react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ReportedPostsTable() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data, isLoading, isError, refetch } = useGetUnifiedReportsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    search: searchQuery.trim() || undefined,
  });
  const [reviewReport, { isLoading: isReviewing }] = useReviewUnifiedReportMutation();
  const [deleteReport] = useDeleteUnifiedReportMutation();
  const [selectedReport, setSelectedReport] = useState<UnifiedReportItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<{
    id: number | string;
    type: 'post' | 'user';
    title: string;
  } | null>(null);

  const reports = useMemo((): UnifiedReportItem[] => {
    if (!data) return [];
    
    // Handle different response structures
    if (data.results) {
      if (typeof data.results === 'object' && !Array.isArray(data.results)) {
        if (data.results.data && Array.isArray(data.results.data)) {
          return data.results.data;
        }
      }
      if (Array.isArray(data.results)) {
        return data.results;
      }
    }
    
    if (Array.isArray(data.data)) {
      return data.data;
    }
    
    return [];
  }, [data]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { 
        bg: "bg-yellow-500/20", 
        text: "text-yellow-300",
        icon: <Clock className="w-3 h-3" />
      },
      reviewed: { 
        bg: "bg-blue-500/20", 
        text: "text-blue-300",
        icon: <Eye className="w-3 h-3" />
      },
      resolved: { 
        bg: "bg-green-500/20", 
        text: "text-green-300",
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      dismissed: { 
        bg: "bg-gray-500/20", 
        text: "text-gray-300",
        icon: <XCircle className="w-3 h-3" />
      },
    };
    
    const statusKey = (status || "pending").toLowerCase();
    const colors = statusColors[statusKey] || statusColors.pending;
    
    return (
      <div className="flex items-center justify-center gap-1.5">
        {colors.icon}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
        </span>
      </div>
    );
  };

  const getReasonLabel = (reason: string | undefined) => {
    const reasonLabels: Record<string, string> = {
      spam: "Spam",
      harassment: "Harassment",
      hate_speech: "Hate Speech",
      violence: "Violence",
      misinformation: "Misinformation",
      copyright: "Copyright",
      inappropriate_content: "Inappropriate Content",
      fake_account: "Fake Account",
      other: "Other",
    };
    return reasonLabels[reason || "other"] || "Other";
  };

  const handleReview = async (reportId: number | string, reportType: 'post' | 'user', status: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      await reviewReport({ reportId, reportType, status }).unwrap();
      toast.success(`Report marked as ${status}`);
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to update report status";
      toast.error("Failed to update report", { description: errorMessage });
    }
  };

  const handleRowClick = (report: UnifiedReportItem) => {
    setSelectedReport(report);
    setDetailsModalOpen(true);
  };

  const handleViewPost = (postId: number | string | undefined) => {
    if (postId) {
      router.push(`/main/post/${postId}`);
    }
  };

  const handleDeleteClick = (report: UnifiedReportItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report.id) return;
    const reportType = report.report_type || 'post';
    const reportTitle = report.report_type === 'post' 
      ? report.post_title || 'Post Report'
      : getReportedItemName(report) || 'User Report';
    setReportToDelete({ id: report.id, type: reportType as 'post' | 'user', title: reportTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    try {
      await deleteReport({ 
        reportId: reportToDelete.id, 
        reportType: reportToDelete.type 
      }).unwrap();
      toast.success("Report deleted successfully!");
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string; message?: string } })?.data?.error ||
        (error as { data?: { error?: string; message?: string } })?.data?.message ||
        "Failed to delete report";
      toast.error("Failed to delete report", { description: errorMessage });
    }
  };

  const getReporterName = (report: UnifiedReportItem) => {
    if (report.report_type === 'user' && report.reporter) {
      if (typeof report.reporter === 'object' && report.reporter !== null && !Array.isArray(report.reporter)) {
        return report.reporter.username || report.reporter.display_name || "N/A";
      }
    }
    return report.reporter_name || "N/A";
  };

  const getReportedItemName = (report: UnifiedReportItem) => {
    if (report.report_type === 'post') {
      return report.post_title || "N/A";
    } else {
      if (report.reported_user) {
        if (typeof report.reported_user === 'object') {
          return report.reported_user.username || report.reported_user.display_name || "N/A";
        }
      }
      return "N/A";
    }
  };

  type ReportRow = UnifiedReportItem;

  const columns: Column<ReportRow>[] = [
    {
      header: "SL",
      accessor: (row, index) => <span>{index + 1}.</span>,
    },
    {
      header: "Type",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.report_type === 'post' ? (
            <FileText className="w-4 h-4 text-blue-400" />
          ) : (
            <User className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-xs text-white/60">{row.type_label || (row.report_type === 'post' ? 'Post' : 'User')}</span>
        </div>
      ),
    },
    {
      header: (row: ReportRow) => row.report_type === 'post' ? "Post Title" : "Reported User",
      accessor: (row) => {
        if (row.report_type === 'post') {
          return (
            <div 
              className="max-w-xs truncate cursor-pointer hover:text-blue-400 transition-colors" 
              title={row.post_title || "N/A"}
              onClick={(e) => {
                e.stopPropagation();
                handleViewPost(row.post_id || row.post);
              }}
            >
              {row.post_title || "N/A"}
            </div>
          );
        } else {
          return (
            <div className="max-w-xs truncate" title={getReportedItemName(row)}>
              {getReportedItemName(row)}
            </div>
          );
        }
      },
    },
    {
      header: "Reporter",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={getReporterName(row)}>
          {getReporterName(row)}
        </div>
      ),
    },
    {
      header: (row: ReportRow) => row.report_type === 'post' ? "Post Author" : "Reported User",
      accessor: (row) => {
        if (row.report_type === 'post') {
          return (
            <div className="max-w-xs truncate" title={row.post_author || "N/A"}>
              {row.post_author || "N/A"}
            </div>
          );
        } else {
          return (
            <div className="max-w-xs truncate" title={getReportedItemName(row)}>
              {getReportedItemName(row)}
            </div>
          );
        }
      },
    },
    {
      header: "Reason",
      accessor: (row) => (
        <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
          {getReasonLabel(row.reason)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status),
      className: "text-center",
    },
    {
      header: "Reported At",
      accessor: (row) => <span className="text-sm">{formatDate(row.created_at)}</span>,
    },
    {
      header: "Reviewed By",
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.reviewed_by_name || "Not reviewed"}>
          {row.reviewed_by_name || "—"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => {
        const isPending = row.status === 'pending';
        const reportType = row.report_type || 'post';
        return (
          <div className="flex items-center justify-center space-x-3">
            {isPending && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReview(row.id!, reportType as 'post' | 'user', 'reviewed');
                  }}
                  disabled={isReviewing}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Mark as Reviewed"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReview(row.id!, reportType as 'post' | 'user', 'resolved');
                  }}
                  disabled={isReviewing}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Mark as Resolved"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReview(row.id!, reportType as 'post' | 'user', 'dismissed');
                  }}
                  disabled={isReviewing}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Dismiss"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {!isPending && (
              <span className="text-xs text-white/40">Reviewed</span>
            )}
            <button
              onClick={(e) => handleDeleteClick(row, e)}
              className="p-2 cursor-pointer rounded-lg bg-white/10 hover:bg-white/20 transition"
              title="Delete report"
            >
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
        );
      },
      className: "text-center",
    },
  ];

  return (
    <>
      <div className="w-[88vw] lg:w-full rounded-2xl border border-white/20 flex flex-col">
        <CustomTable
          columns={columns}
          data={reports}
          title="All Reports"
          isLoading={isLoading}
          filters={
            <>
              <TableFilters
                filters={[
                  {
                    type: "select",
                    key: "status",
                    label: "Status",
                    options: [
                      { label: "All", value: "all" },
                      { label: "Pending", value: "pending" },
                      { label: "Reviewed", value: "reviewed" },
                      { label: "Resolved", value: "resolved" },
                      { label: "Dismissed", value: "dismissed" },
                    ],
                    value: statusFilter,
                    onChange: (value) => {
                      setStatusFilter(value);
                    },
                  },
                ]}
              />
              <DateFilter
                value={datePreset}
                dateRange={dateRange}
                onChange={(preset, range) => {
                  setDatePreset(preset);
                  setDateRange(range);
                }}
                label="Date"
              />
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by reporter, reason, or content..."
                label="Search"
              />
            </>
          }
          emptyMessage="No reports found"
          isError={isError}
          errorMessage="Failed to load reports. Please try again later"
          disablePagination={true}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Report Details Modal */}
      {detailsModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1F2149] border border-white/20 rounded-xl p-6 max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Report Details</h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">Report Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedReport.report_type === 'post' ? (
                    <FileText className="w-4 h-4 text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-purple-400" />
                  )}
                  <p className="text-white font-medium">{selectedReport.type_label || (selectedReport.report_type === 'post' ? 'Post Report' : 'User Report')}</p>
                </div>
              </div>

              {selectedReport.report_type === 'post' ? (
                <>
                  <div>
                    <label className="text-sm text-white/60">Post Title</label>
                    <p className="text-white font-medium">{selectedReport.post_title || "N/A"}</p>
                    {selectedReport.post_id && (
                      <button
                        onClick={() => handleViewPost(selectedReport.post_id!)}
                        className="mt-1 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        View Post →
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60">Reporter</label>
                      <p className="text-white">{getReporterName(selectedReport)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/60">Post Author</label>
                      <p className="text-white">{selectedReport.post_author || "N/A"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Reporter</label>
                    <p className="text-white">{getReporterName(selectedReport)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Reported User</label>
                    <p className="text-white">{getReportedItemName(selectedReport)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Reason</label>
                  <p className="text-white">{getReasonLabel(selectedReport.reason)}</p>
                </div>
                <div>
                  <label className="text-sm text-white/60">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm text-white/60">Description</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg mt-1">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Reported At</label>
                  <p className="text-white text-sm">{formatDate(selectedReport.created_at)}</p>
                </div>
                {selectedReport.reviewed_at && (
                  <div>
                    <label className="text-sm text-white/60">Reviewed At</label>
                    <p className="text-white text-sm">{formatDate(selectedReport.reviewed_at)}</p>
                  </div>
                )}
              </div>

              {selectedReport.reviewed_by_name && (
                <div>
                  <label className="text-sm text-white/60">Reviewed By</label>
                  <p className="text-white">{selectedReport.reviewed_by_name}</p>
                </div>
              )}

              {selectedReport.admin_notes && (
                <div>
                  <label className="text-sm text-white/60">Admin Notes</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg mt-1">
                    {selectedReport.admin_notes}
                  </p>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      const reportType = selectedReport.report_type || 'post';
                      handleReview(selectedReport.id!, reportType as 'post' | 'user', 'reviewed');
                      setDetailsModalOpen(false);
                    }}
                    disabled={isReviewing}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => {
                      const reportType = selectedReport.report_type || 'post';
                      handleReview(selectedReport.id!, reportType as 'post' | 'user', 'resolved');
                      setDetailsModalOpen(false);
                    }}
                    disabled={isReviewing}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => {
                      const reportType = selectedReport.report_type || 'post';
                      handleReview(selectedReport.id!, reportType as 'post' | 'user', 'dismissed');
                      setDetailsModalOpen(false);
                    }}
                    disabled={isReviewing}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Report?"
        description={`Are you sure you want to delete this ${reportToDelete?.type === 'post' ? 'post' : 'user'} report? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setReportToDelete(null);
        }}
      />
    </>
  );
}

