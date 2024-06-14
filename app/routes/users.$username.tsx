import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { db } from '#app/utils/db.server.js';
import { invariantResponse } from '#app/utils/misc.js';

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;
  const user = db.user.findFirst({
    where: {
      username: { equals: username },
    },
  });

  invariantResponse(user, 'User not found', { status: 404 });

  return json({
    user: {
      name: user.name,
      username: user.username,
    },
  });
}

export default function UsernameRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>
        <strong>{data.user.name ?? data.user.username}</strong>
      </h1>
      <Link to="notes">Notes</Link>
    </div>
  );
}
