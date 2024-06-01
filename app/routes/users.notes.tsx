import { Outlet } from '@remix-run/react';

export default function UsersNotesRoute() {
  return (
    <>
      <p>Some Notes selected.</p>
      <Outlet />
    </>
  );
}
