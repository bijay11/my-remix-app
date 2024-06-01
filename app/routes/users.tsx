import { Outlet } from '@remix-run/react';
export default function UsersRoute() {
  return (
    <>
      <p>Users Route</p>
      <Outlet />
    </>
  );
}
