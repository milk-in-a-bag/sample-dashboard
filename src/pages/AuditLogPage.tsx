import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
export function AuditLogPage() {
  const { auditEvents } = useApp();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  // Filter logic
  const filteredEvents = auditEvents.filter((event) => {
    if (fromDate && new Date(event.timestamp) < new Date(fromDate)) return false;
    if (toDate && new Date(event.timestamp) > new Date(toDate + 'T23:59:59Z'))
    return false;
    return true;
  });
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="date"
            label="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)} />
          
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="date"
            label="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)} />
          
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setFromDate('');
            setToDate('');
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto">
          
          Clear Filters
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  
                  Timestamp
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  
                  Event Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  
                  Actor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  
                  IP Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedEvents.length === 0 ?
              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  
                    No audit events found for the selected criteria.
                  </td>
                </tr> :

              paginatedEvents.map((event) =>
              <tr
                key={event.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <EventBadge type={event.type} />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {event.actor}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                      {event.ipAddress}
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-300 truncate max-w-md">
                      {event.detail}
                    </td>
                  </tr>
              )
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Page{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {currentPage}
            </span>{' '}
            of{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {totalPages}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}>
              
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}>
              
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>);

}