import PageClient from '../[id]/edit/PageClient';

// Static route that works without host rewrites: /dashboard/profiles/edit/?id=<id>
export default function Page() {
  return <PageClient />;
}
