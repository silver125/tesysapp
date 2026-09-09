import { useState } from 'react';
import { CompanyMark } from './ui';
import { companyInitials, companyTint } from '../lib/uiHelpers';

export default function CompanyAvatar({
  name,
  avatarUrl,
  size = 60,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const url = avatarUrl?.trim();
  const radius = Math.round(size / 3.8);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = Boolean(url && failedUrl === url);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setFailedUrl(url)}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid rgba(245,130,32,0.14)',
          background: '#fff',
        }}
      />
    );
  }

  return (
    <CompanyMark
      code={companyInitials(name, 'EM')}
      tint={companyTint(name)}
      size={size}
      radius={radius}
    />
  );
}
