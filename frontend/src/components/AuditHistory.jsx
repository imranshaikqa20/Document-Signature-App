import { useEffect, useState } from "react";
import { getAuditHistory } from "../services/auditService";

export default function AuditHistory({ documentId }) {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [documentId, page]);

  const fetchLogs = async () => {
    try {
      const res = await getAuditHistory(documentId, page, 10);
      setLogs(res.data.content); // because backend returns Page<>
    } catch (err) {
      console.error("Failed to load audit history", err);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-semibold mb-3">Audit History</h3>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Action</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">IP</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border">{log.action}</td>
              <td className="p-2 border">{log.performedBy}</td>
              <td className="p-2 border">{log.ipAddress}</td>
              <td className="p-2 border">
                {new Date(log.performedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-3">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Previous
        </button>

        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}