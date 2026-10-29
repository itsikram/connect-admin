'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Placeholder segment that dynamic routes are prerendered with in the static export.
export const STATIC_PARAM = '_';

// Drop-in replacement for useParams() that also works in the static export,
// where every /posts/<id> URL is served by the prerendered /posts/_ page.
// `positions` maps a param name to its path segment index, e.g. { id: 2 } for /dashboard/posts/[id].
// A query param of the same name (e.g. /dashboard/posts/view/?id=<id>) takes precedence, so pages
// can be reached on static hosts that have no rewrite rules.
export function useRouteParams(positions) {
  const params = useParams();
  const [resolved, setResolved] = useState(() =>
    Object.values(params).includes(STATIC_PARAM) ? {} : params
  );

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const fromQuery = Object.keys(positions).some((name) => search.has(name));
    if (!fromQuery && !Object.values(params).includes(STATIC_PARAM)) {
      setResolved(params);
      return;
    }
    const segments = window.location.pathname.split('/').filter(Boolean);
    const next = { ...params };
    for (const [name, index] of Object.entries(positions)) {
      if (search.has(name)) next[name] = search.get(name);
      else if (next[name] === STATIC_PARAM) next[name] = decodeURIComponent(segments[index] ?? '');
    }
    setResolved(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return resolved;
}
