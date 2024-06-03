import { Outlet } from '@remix-run/react';

export default function NotesRoute() {
  return (
    <>
      <h1>Notes</h1>
      <Outlet />
    </>
  );
}
