import PageClient from '../[id]/PageClient';

// Static route that works without host rewrites: /dashboard/profiles/view/?id=<id>
export default function Page() {
  return <PageClient />;
}
