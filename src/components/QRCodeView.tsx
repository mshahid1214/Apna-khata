import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  onOpenVerify?: () => void;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 96,
  className = '',
  onOpenVerify,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [value, size]);

  if (!dataUrl) {
    return <div className="w-20 h-20 bg-stone-200 animate-pulse rounded" />;
  }

  return (
    <button
      type="button"
      onClick={onOpenVerify}
      className={`inline-block p-1 bg-white rounded-lg border border-stone-300 shadow-2xs hover:ring-2 hover:ring-amber-500 transition-all ${className}`}
      title="کلک کر کے تصدیقی صفحہ دیکھیں (Click to verify)"
    >
      <img src={dataUrl} alt="Slip Verification QR Code" width={size} height={size} />
      <span className="block text-[8px] font-mono text-center text-stone-500 mt-0.5 tracking-tighter">
        تصدیق اسکین کریں
      </span>
    </button>
  );
};
