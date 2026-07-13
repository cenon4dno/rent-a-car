'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { uploadDocument } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface KycUploaderProps {
  type: string;
  label: string;
  description: string;
  currentUrl: string | null;
  accept?: string;
}

export function KycUploader({
  type,
  label,
  description,
  currentUrl,
  accept = '.jpg,.jpeg,.png,.pdf',
}: KycUploaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.apiToken) return;
    setUploading(true);
    setError(null);
    setDone(false);
    try {
      await uploadDocument(type, file, session.apiToken);
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const uploaded = done || !!currentUrl;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            {uploaded ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Uploaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{description}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
          />
          <Button
            size="sm"
            variant={uploaded ? 'secondary' : 'primary'}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploaded ? 'Replace' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
