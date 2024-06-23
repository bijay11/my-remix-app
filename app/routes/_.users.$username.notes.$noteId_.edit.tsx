import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { db } from '#app/utils/db.server.js';
import { invariantResponse } from '#app/utils/misc.js';
import { Label } from '#app/components/ui/label';
import { Input } from '#app/components/ui/input';
import { floatingToolbarClassName } from '#app/components/floating-toolbar.js';
import { Button } from '#app/components/ui/button';

export async function loader({ params }: LoaderFunctionArgs) {
  const note = db.note.findFirst({
    where: {
      id: {
        equals: params.noteId,
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

export default function NoteEdit() {
  const { note } = useLoaderData<typeof loader>();

  return (
    <Form
      method="POST"
      className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
    >
      <div className="flex flex-col gap-1">
        <div>
          <Label>Title</Label>
          <Input name="title" defaultValue={note.title} />
        </div>
        <div>
          <Label>Content</Label>
          <Input name="title" defaultValue={note.content} />
        </div>
      </div>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset">
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
}
