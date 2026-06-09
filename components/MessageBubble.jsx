'use client';

import DataTable from './DataTable';
import ChartView from './ChartView';
import { Package, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="max-w-[75%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-1">
          <Package className="w-4 h-4 text-red-500" />
        </div>
        <div className="max-w-[85%] bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-red-600 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div className="flex justify-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1">
        <Package className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[85%] flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          {message.table && <DataTable rows={message.table} />}
          {message.chart && <ChartView chart={message.chart} />}
        </div>
        {message.timestamp && (
          <p className="text-xs text-slate-400 mt-1 ml-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
