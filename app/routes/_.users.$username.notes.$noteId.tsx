import { Link, useLoaderData } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Button } from '#app/components/ui/button';
import { db } from '#app/utils/db.server.js';
import { invariantResponse } from '#app/utils/misc.js';
import { floatingToolbarClassName } from '#app/components/floating-toolbar';

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
    },
  });
}

export default function NoteRoute() {
  const { note } = useLoaderData<typeof loader>();
  return (
    <div className="absolute inset-0 flex flex-col px-10">
      <h2 className="mb-2 pt-12 text-h2 lg:mb-6">{note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <p className="whitespace-break-spaces text-sm md:text-lg">
          {note.content}
        </p>
      </div>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive">Delete</Button>
        <Button asChild variant="default">
          <Link to="edit">Edit</Link>
        </Button>
      </div>
    </div>
  );
}
