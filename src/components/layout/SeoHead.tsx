import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://yuumotion.wasmer.app';
const DEFAULT_TITLE = 'Yuumotion — Kanban Board, Timeline & Dokumen Tim';
const DEFAULT_DESC =
  'Yuumotion adalah ruang kerja produktivitas open-source offline-first yang menggabungkan Kanban Board multi-view (Tabel, Kalender, Gantt Timeline) dan editor dokumen TipTap.';

export const SeoHead: React.FC<SeoHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonicalPath = '/',
  noIndex = false
}) => {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
