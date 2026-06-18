import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router';

export function PublicLayout() {
  return (
    <>
      <Helmet>
        <title>Public Info</title>
      </Helmet>

      <div className="min-h-dvh w-full min-w-0 grow self-start bg-admin-page text-admin-neutral-800">
        <Outlet />
      </div>
    </>
  );
}
