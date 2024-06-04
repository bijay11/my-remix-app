import { Link, Outlet, NavLink, useParams } from '@remix-run/react';

export default function NotesRoute() {
  const { username } = useParams();
  return (
    <div className="flex justify-between">
      <div>
        <h1>Notes</h1>
        <Link to=".." relative="path">
          Back to {username}
        </Link>
        <br />
        <NavLink
          to=""
          className={({ isActive }) =>
            `underline ${isActive ? 'bg-accent bg-blue-800' : ''}`
          }
        >
          Some Note
        </NavLink>
      </div>
      <div className="border border-blue-400 p-4 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
