'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
}

export function QrCode({ value, size = 160 }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    });
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-md border border-gray-100" />
      <p className="text-xs font-mono text-gray-500">{value}</p>
    </div>
  );
}
