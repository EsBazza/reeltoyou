'use client';

import { Share2 } from 'lucide-react';
import { Button } from './ui/Button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EntryActionsProps {
  recipientName: string;
}

export default function EntryActions({ recipientName }: EntryActionsProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: `A movie moment for ${recipientName}`,
        url: window.location.href,
      }).catch(console.error);
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <Button className="flex-1 bg-accent hover:bg-accent/90" size="lg" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Send the Letter
      </Button>
      <Link href="/" className="flex-1">
        <Button variant="outline" size="lg" className="w-full">
          Share a Moment
        </Button>
      </Link>
    </div>
  );
}
