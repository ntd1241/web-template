import { QRCodeSVG } from 'qrcode.react';
import {
  materialQrLabel,
  publicDetailIcons,
} from '../data/material-public-detail.mock';
import { PublicInfoCard } from './public-info-card';

function getCurrentPageUrl() {
  if (typeof window === 'undefined') {
    return materialQrLabel.code;
  }

  return window.location.href;
}

export function MaterialQrCode({
  className = 'size-16 shrink-0',
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const value = getCurrentPageUrl();

  return (
    <QRCodeSVG
      aria-label={`QR Code ${materialQrLabel.code}`}
      bgColor="#ffffff"
      className={className}
      data-qr-value={value}
      fgColor="#111827"
      level="M"
      marginSize={1}
      size={size}
      title={`QR Code ${materialQrLabel.code}`}
      value={value}
    />
  );
}

export function MaterialQrLabelCard() {
  return (
    <PublicInfoCard title="Nhãn QR Code" icon={publicDetailIcons.QrCode}>
      <div className="grid min-h-24 grid-cols-[88px_minmax(0,1fr)_minmax(124px,0.8fr)] overflow-hidden rounded-lg border border-admin-neutral-300 bg-white text-admin-neutral-950">
        <div className="row-span-2 flex items-center justify-center border-r border-admin-neutral-300 p-2">
          <MaterialQrCode />
        </div>
        <div className="col-span-2 flex min-w-0 items-center justify-center border-b border-admin-neutral-300 px-2.5 py-3">
          <h3 className="truncate text-sm font-semibold leading-5">
            {materialQrLabel.name}
          </h3>
        </div>
        <div className="flex min-w-0 items-center overflow-hidden border-r border-admin-neutral-300 px-2 py-3">
          <span className="min-w-0 truncate text-[12px] font-semibold">
            {materialQrLabel.code}
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-end overflow-hidden px-2 py-3">
          <span className="min-w-0 truncate text-right text-[12px] font-semibold">
            Ngày cấp: {materialQrLabel.issuedDate}
          </span>
        </div>
      </div>
    </PublicInfoCard>
  );
}
