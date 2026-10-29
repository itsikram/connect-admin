import PageClient from '../[id]/PageClient';

// Static route that works without host rewrites: /dashboard/watch/view/?id=<id>
export default function Page() {
  return <PageClient />;
}
