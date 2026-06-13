'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportButtonProps {
  slug: string;
}

export default function ReportButton({ slug }: ReportButtonProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReport = async () => {
    if (hasReported) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to report this moment? Entries that receive multiple reports are automatically hidden."
    );
    
    if (!confirmed) return;

    setIsReporting(true);
    setError(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) throw new Error('Failed to submit report');
      
      setHasReported(true);
    } catch {
      setError('Failed to report. Try again.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        disabled={isReporting || hasReported}
        onClick={handleReport}
        className={`text-[9px] flex items-center transition-colors font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
          hasReported ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-accent hover:bg-accent/5'
        }`}
      >
        {hasReported ? (
          <>
            <CheckCircle className="h-2.5 w-2.5 mr-1" />
            Reported
          </>
        ) : (
          <>
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
            {isReporting ? 'Reporting...' : 'Report Content'}
          </>
        )}
      </button>
      {error && <span className="text-[7px] text-accent mt-1">{error}</span>}
    </div>
  );
}
