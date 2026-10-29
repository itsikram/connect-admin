import PageClient from '../[id]/PageClient';

// Static route that works without host rewrites: /dashboard/posts/view/?id=<id>
export default function Page() {
  return <PageClient />;
}
