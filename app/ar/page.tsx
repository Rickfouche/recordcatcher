// app/ar/page.tsx  (SERVER file — no "use client")
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ARPageClient from './ARPageClient';

export default function Page() {
  return <ARPageClient />;
}
