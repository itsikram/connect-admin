import PageClient from './PageClient';

// Prerender a single placeholder page; the real id is read from the URL on the client.
export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <PageClient />;
}
