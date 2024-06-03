import { Link, Outlet, NavLink } from '@remix-run/react';

export default function NotesRoute() {
  return (
    <div className="flex justify-between">
      <h1>Notes</h1>
      <Link to=".." relative="path">
        Back to Bijay
      </Link>
      <NavLink
        to="some-note-id"
        className={({ isActive }) => {
          console.log('===test isActive', isActive);

          return `underline ${isActive ? 'bg-accent bg-blue-800' : ''}`;
        }}
      >
        Some Note
      </NavLink>
      <div className="border border-blue-400 p-4 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
