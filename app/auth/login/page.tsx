// app/auth/login/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = false;            // no caching
export const fetchCache = 'force-no-store'; // never pre-render

import LoginClient from './LoginClient';

export default function Page() {
  return <LoginClient />;
}
