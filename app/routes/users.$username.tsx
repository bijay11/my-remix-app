import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  MetaFunction,
  useLoaderData,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { db } from '#app/utils/db.server.js';
import { invariantResponse } from '#app/utils/misc.js';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username;
  return [
    { title: `${displayName} | User` },
    { name: 'description', content: `${displayName}'s description` },
  ];
};

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
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>
        <strong>{user.name ?? user.username}</strong>
      </h1>
      <Link to="notes" className="underline" prefetch="intent">
        Notes
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.log('=====test error', { error });
  const params = useParams();
  console.log('=====test error', { status: error.status });

  let errorMessage = <p>Oh no, something went wrong. Sorry about that.</p>;
  if (isRouteErrorResponse(error) && error.status === 404) {
    errorMessage = <p>No user {params.username} found.</p>;
  }

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
      {errorMessage}
    </div>
  );
}
