import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, MetaFunction, useLoaderData } from '@remix-run/react';
import { prisma } from '#app/utils/db.server';
import { invariantResponse, getUserImgSrc } from '#app/utils/misc';
import { GeneralErrorBoundary } from '#app/components/error-boundary';
import { Spacer } from '#app/components/ui/spacer';
import { Button } from '#app/components/ui/button';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username;
  return [
    { title: `${displayName} | User` },
    { name: 'description', content: `${displayName}'s description` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await prisma.user.findUnique({
    where: {
      username: params.username,
    },
    select: {
      name: true,
      username: true,
      createdAt: true,
      image: { select: { id: true } },
    },
  });

  invariantResponse(user, 'User not found', { status: 404 });

  return json({
    user,
    userJoinedDisplay: new Date(user.createdAt).toLocaleDateString(),
  });
}

export default function UsernameRoute() {
  const { user, userJoinedDisplay } = useLoaderData<typeof loader>();
  const userDisplayName = user.name ?? user.username;

  console.log('==== test user', user);

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center">
      <Spacer size="4xs" />

      <div className="container flex flex-col items-center rounded-3xl bg-muted p-12">
        <div className="relative w-52">
          <div className="absolute -top-40">
            <div className="relative">
              <img
                src={getUserImgSrc(user.image?.id)}
                alt={userDisplayName}
                className="h-52 w-52 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        <Spacer size="sm" />

        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="text-center text-h2">{userDisplayName}</h1>
          </div>
          <p className="mt-2 text-center text-muted-foreground">
            Joined {userJoinedDisplay}
          </p>
          <div className="mt-10 flex gap-4">
            <Button asChild>
              <Link to="notes" prefetch="intent">
                {`${userDisplayName}'s notes`}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => {
          return <p>No user {params.username} found.</p>;
        },
      }}
    />
  );
}
