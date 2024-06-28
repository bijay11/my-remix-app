import {
  json,
  redirect,
  type LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node';
import {
  Form,
  useFormAction,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import { floatingToolbarClassName } from '#app/components/floating-toolbar';
import { Button } from '#app/components/ui/button';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import { Textarea } from '#app/components/ui/textarea';
import { db } from '#app/utils/db.server';
import { invariantResponse } from '#app/utils/misc';
import { StatusButton } from '#app/components/ui/status-button.js';
import { GeneralErrorBoundary } from '#app/components/error-boundary.js';

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
    note: { title: note.title, content: note.content },
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title');
  const content = formData.get('content');

  invariantResponse(typeof title === 'string', 'Title must be a string', {
    status: 400,
  });

  invariantResponse(typeof content === 'string', 'Content must be a string', {
    status: 400,
  });

  db.note.update({
    where: { id: { equals: params.noteId } },
    data: { title, content },
  });

  return redirect(`/users/${params.username}/notes/${params.noteId}`);
}

export default function NoteEdit() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const formAction = useFormAction();
  const isPending =
    navigation.state !== 'idle' &&
    navigation.formAction === formAction &&
    navigation.formMethod === 'POST';

  return (
    <Form
      method="POST"
      className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
    >
      <div className="flex flex-col gap-1">
        <div>
          {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
          <Label>Title</Label>
          <Input name="title" defaultValue={data.note.title} />
        </div>
        <div>
          {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
          <Label>Content</Label>
          <Textarea name="content" defaultValue={data.note.content} />
        </div>
      </div>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset">
          Reset
        </Button>
        <StatusButton
          type="submit"
          disabled={isPending}
          status={isPending ? 'pending' : 'idle'}
        >
          Submit
        </StatusButton>
      </div>
    </Form>
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
