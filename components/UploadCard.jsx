'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, Package } from 'lucide-react';

export default function UploadCard({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  }

  function validateAndSet(f) {
    setError(null);
    if (!f.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed.');
        return;
      }

      onUploadSuccess(data);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Shipment Insights AI
          </h1>
          <p className="mt-2 text-slate-500 text-base">
            Upload a shipment CSV and analyze it using natural language.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {(file.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="font-medium text-slate-600 text-sm">
                    Drop your CSV here or{' '}
                    <span className="text-blue-600 underline">browse files</span>
                  </p>
                  <p className="text-slate-400 text-xs mt-1">CSV files only</p>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !file}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          </form>

          {/* Sample hint */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Don&apos;t have a file?{' '}
            <a
              href="/sample-shipments.csv"
              download
              className="text-blue-500 hover:underline"
            >
              Download sample CSV
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Data is processed in-memory and cleared when you end the session.
        </p>
      </div>
    </div>
  );
}
