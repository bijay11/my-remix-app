import { Form, Link, useLoaderData } from '@remix-run/react';
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Button } from '#app/components/ui/button';
import { db } from '#app/utils/db.server.js';
import { invariantResponse } from '#app/utils/misc.js';
import { floatingToolbarClassName } from '#app/components/floating-toolbar';
import { GeneralErrorBoundary } from '#app/components/error-boundary.js';

export async function loader({ params }: LoaderFunctionArgs) {
  const { noteId } = params;

  const note = db.note.findFirst({
    where: {
      id: {
        equals: noteId,
      },
    },
  });

  invariantResponse(note, 'Note not found', { status: 404 });

  return json({
    note: {
      title: note.title,
      content: note.content,
      images: note.images.map((image) => ({
        id: image.id,
        altText: image.altText,
      })),
    },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  invariantResponse(intent === 'delete', 'Invalid intent');

  db.note.delete({ where: { id: { equals: params.noteId } } });
  return redirect(`/users/${params.username}/notes`);
}

export default function NoteRoute() {
  const { note } = useLoaderData<typeof loader>();
  return (
    <div className="absolute inset-0 flex flex-col px-10">
      <h2 className="mb-2 pt-12 text-h2 lg:mb-6">{note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <ul className="flex flex-wrap gap-5 py-5">
          {note.images.map((image) => (
            <li key={image.id}>
              <a href={`/resources/images/${image.id}`}>
                <img
                  src={`/resources/images/${image.id}`}
                  alt={image.altText ?? ''}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
        <p className="whitespace-break-spaces text-sm md:text-lg">
          {note.content}
        </p>
      </div>
      <div className={floatingToolbarClassName}>
        <Form method="POST">
          <Button
            variant="destructive"
            type="submit"
            name="intent"
            value="delete"
          >
            Delete
          </Button>
        </Form>
        <Button asChild variant="default">
          <Link to="edit">Edit</Link>
        </Button>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => {
          return <p>No note found with the id {`"${params.noteId}"`}</p>;
        },
      }}
    />
  );
}
