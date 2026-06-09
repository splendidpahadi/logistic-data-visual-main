'use client';

export default function DataTable({ rows }) {
  if (!rows || rows.length === 0) return null;

  const headers = Object.keys(rows[0]);

  return (
    <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 last:border-0 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                } hover:bg-blue-50/40`}
              >
                {headers.map((h) => (
                  <td key={h} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                    {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
