import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, Outlet, NavLink, useLoaderData } from '@remix-run/react';
import { db } from '#app/utils/db.server.js';
import { cn, invariantResponse } from '#app/utils/misc.js';

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;

  const owner = db.user.findFirst({
    where: {
      username: {
        equals: username,
      },
    },
  });

  const notes = db.note.findMany({
    where: {
      owner: {
        username: {
          equals: username,
        },
      },
    },
  });

  invariantResponse(owner, 'Owner not found', { status: 404 });

  return json({
    owner: {
      name: owner.name,
      username: owner.username,
    },
    notes: notes.map(({ id, title }) => ({ id, title })),
  });
}

export default function NotesRoute() {
  const { owner, notes } = useLoaderData<typeof loader>();

  const ownerDisplayName = owner.name ?? owner.username;

  const navLinkDefaultClassName =
    'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl';

  return (
    <main className="container flex h-full min-h-[400px] pb-12 px-0 md:px-8">
      <div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
        <div className="relative col-span-1">
          <div className="absolute inset-0 flex flex-col">
            <Link
              to={`/users/${owner.username}`}
              className="pb-4 pl-8 pr-4 pt-12"
            >
              <h1 className="text-base font-bold md:text-lg lg:text-left lg:text-2xl">
                {ownerDisplayName}&apos;s Notes
              </h1>
            </Link>
            <ul className="overflow-y-auto overflow-x-hidden pb-12">
              {notes.map((note) => (
                <li key={note.id} className="p-1 pr-0">
                  <NavLink
                    to={note.id}
                    className={({ isActive }) =>
                      cn(navLinkDefaultClassName, isActive && 'bg-accent')
                    }
                  >
                    {note.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative col-span-3 bg-accent md:rounded-r-3xl">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
