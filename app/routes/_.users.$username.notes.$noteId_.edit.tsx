import {
  json,
  redirect,
  type LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { floatingToolbarClassName } from '#app/components/floating-toolbar';
import { Button } from '#app/components/ui/button';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import { Textarea } from '#app/components/ui/textarea';
import { db } from '#app/utils/db.server';
import { invariantResponse, useIsSubmitting } from '#app/utils/misc';
import { StatusButton } from '#app/components/ui/status-button.js';
import { GeneralErrorBoundary } from '#app/components/error-boundary.js';
import { useEffect, useState } from 'react';

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

const titleMaxLength = 100;
const contentMaxLength = 10000;

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

  // action runs only on server so adding validation on Server Side
  const errors = {
    formErrors: [] as string[],
    fieldErros: {
      title: [] as string[],
      content: [] as string[],
    },
  };

  if (title === '') {
    errors.fieldErros.title.push('Title is required.');
  }

  if (title.length > titleMaxLength) {
    errors.fieldErros.title.push(
      `Title must be ${titleMaxLength} characters or less.`
    );
  }

  if (content === '') {
    errors.fieldErros.content.push('Content is required.');
  }

  if (content.length > contentMaxLength) {
    errors.fieldErros.content.push(
      `Content must be ${titleMaxLength} characters or less.`
    );
  }

  const hasErrors =
    errors.formErrors.length > 0 ||
    Object.values(errors.fieldErros).some(
      (fieldErrors) => fieldErrors.length > 0
    );

  if (hasErrors) {
    return json({ status: 'error', errors } as const, {
      status: 400,
    });
  }

  db.note.update({
    where: { id: { equals: params.noteId } },
    data: { title, content },
  });

  return redirect(`/users/${params.username}/notes/${params.noteId}`);
}

function ErrorList({ errors }: { errors?: string[] | null }) {
  return errors?.length ? (
    <ul>
      {errors.map((error, i) => (
        <li key={i} className="text-[10px] text-foreground-destructive">
          {error}
        </li>
      ))}
    </ul>
  ) : null;
}

function useHydrated() {
  const [hyrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return hyrated;
}

export default function NoteEdit() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const isSubmitting = useIsSubmitting();
  const formId = 'note-editor';

  const fieldErrors =
    actionData?.status === 'error' ? actionData?.errors?.fieldErros : null;
  const formErrors =
    actionData?.status === 'error' ? actionData?.errors?.formErrors : null;

  const isHydrated = useHydrated();

  return (
    <div className="absolute inset-0">
      <Form
        id={formId}
        method="POST"
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
        noValidate={isHydrated}
      >
        <div className="flex flex-col gap-1">
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label>Title</Label>
            <Input
              name="title"
              defaultValue={data.note.title}
              required
              maxLength={titleMaxLength}
            />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList errors={fieldErrors?.title} />
            </div>
          </div>
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label>Content</Label>
            <Textarea
              name="content"
              defaultValue={data.note.content}
              required
              maxLength={contentMaxLength}
            />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList errors={fieldErrors?.content} />
            </div>
          </div>
        </div>

        <div className="min-h-[32px] px-4 pb-4 pt-1">
          <ErrorList errors={formErrors} />
        </div>
      </Form>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset">
          Reset
        </Button>
        <StatusButton
          type="submit"
          form={formId}
          disabled={isSubmitting}
          status={isSubmitting ? 'pending' : 'idle'}
        >
          Submit
        </StatusButton>
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
