import PageClient from './PageClient';

// Prerender a single placeholder page; the real token is read from the URL on the client.
export function generateStaticParams() {
  return [{ token: '_' }];
}

export default function Page() {
  return <PageClient />;
}
