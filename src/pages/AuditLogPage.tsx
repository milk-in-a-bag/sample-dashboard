import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function AuditLogPage() {
  const {
    auditEvents,
    auditLoading,
    auditTotal,
    auditPage,
    setAuditPage,
    refreshAuditLogs,
  } = useApp();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const pageSize = 15;
  const totalPages = Math.ceil(auditTotal / pageSize) || 1;

  useEffect(() => {
    refreshAuditLogs({
      page: auditPage,
      start_date: fromDate ? `${fromDate}T00:00:00Z` : undefined,
      end_date: toDate ? `${toDate}T23:59:59Z` : undefined,
    });
  }, [auditPage, fromDate, toDate]);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setAuditPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="date"
            label="From Date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setAuditPage(1);
            }}
          />
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="date"
            label="To Date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setAuditPage(1);
            }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={handleClear}
          className="w-full sm:w-auto"
        >
          Clear Filters
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                {[
                  "Timestamp",
                  "Event Type",
                  "User",
                  "IP Address",
                  "Details",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {auditLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : auditEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    No audit events found.
                  </td>
                </tr>
              ) : (
                auditEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-zinc-700 dark:text-zinc-300">
                      {event.eventType}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                      {event.userId ?? "—"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                      {event.ipAddress ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-300 truncate max-w-md">
                      {JSON.stringify(event.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Page{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {auditPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {totalPages}
            </span>{" "}
            ({auditTotal} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={auditPage === 1}
              onClick={() => setAuditPage(auditPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={auditPage === totalPages}
              onClick={() => setAuditPage(auditPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
