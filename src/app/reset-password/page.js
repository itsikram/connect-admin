import PageClient from './[token]/PageClient';

// Static route that works without host rewrites: /reset-password/?token=<token>
export default function Page() {
  return <PageClient />;
}
