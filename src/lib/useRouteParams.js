'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Placeholder segment that dynamic routes are prerendered with in the static export.
export const STATIC_PARAM = '_';

// Drop-in replacement for useParams() that also works in the static export,
// where every /posts/<id> URL is served by the prerendered /posts/_ page.
// `positions` maps a param name to its path segment index, e.g. { id: 2 } for /dashboard/posts/[id].
export function useRouteParams(positions) {
  const params = useParams();
  const [resolved, setResolved] = useState(() =>
    Object.values(params).includes(STATIC_PARAM) ? {} : params
  );

  useEffect(() => {
    if (!Object.values(params).includes(STATIC_PARAM)) {
      setResolved(params);
      return;
    }
    const segments = window.location.pathname.split('/').filter(Boolean);
    const next = { ...params };
    for (const [name, index] of Object.entries(positions)) {
      next[name] = decodeURIComponent(segments[index] ?? '');
    }
    setResolved(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return resolved;
}
