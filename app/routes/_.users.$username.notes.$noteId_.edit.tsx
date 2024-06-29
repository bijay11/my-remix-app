import { useEffect, useRef, useState, useId } from 'react';
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

type ActionErrors = {
  formErrors: Array<string>;
  fieldErrors: {
    title: Array<string>;
    content: Array<string>;
  };
};

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
  const errors: ActionErrors = {
    formErrors: [],
    fieldErrors: {
      title: [],
      content: [],
    },
  };

  if (title === '') {
    errors.fieldErrors.title.push('Title is required.');
  }

  if (title.length > titleMaxLength) {
    errors.fieldErrors.title.push(
      `Title must be ${titleMaxLength} characters or less.`
    );
  }

  if (content === '') {
    errors.fieldErrors.content.push('Content is required.');
  }

  if (content.length > contentMaxLength) {
    errors.fieldErrors.content.push(
      `Content must be ${titleMaxLength} characters or less.`
    );
  }

  const hasErrors =
    errors.formErrors.length > 0 ||
    Object.values(errors.fieldErrors).some(
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

function ErrorList({ errors, id }: { errors?: string[] | null; id?: string }) {
  return errors?.length ? (
    <ul>
      {errors.map((error, i) => (
        <li key={i} id={id} className="text-[10px] text-foreground-destructive">
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
  const formRef = useRef<HTMLFormElement>(null);
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();
  const titleId = useId();

  const formId = 'note-editor';

  const fieldErrors =
    actionData?.status === 'error' ? actionData?.errors?.fieldErrors : null;
  const formErrors =
    actionData?.status === 'error' ? actionData?.errors?.formErrors : null;

  const isHydrated = useHydrated();

  const formHasErrors = Boolean(formErrors?.length);
  const formErrorId = formHasErrors ? 'form-error' : undefined;
  const titleHasErrors = Boolean(fieldErrors?.title.length);
  const titleErrorId = titleHasErrors ? 'title-error' : undefined;
  const contentHasErrors = Boolean(fieldErrors?.content.length);
  const contentErrorId = contentHasErrors ? 'content-error' : undefined;

  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;
    if (actionData?.status !== 'error') return;

    if (formEl.matches('[aria-invalid="true"]')) {
      formEl.focus();
    } else {
      const firstInvalidField = formEl.querySelector('[aria-invalid="true"]');

      if (firstInvalidField instanceof HTMLElement) {
        firstInvalidField.focus();
      }
    }
  }, [actionData]);

  return (
    <div className="absolute inset-0">
      <Form
        id={formId}
        ref={formRef}
        method="POST"
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
        noValidate={isHydrated}
        aria-invalid={formHasErrors || undefined}
        aria-describedby={formErrorId}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-1">
          <div>
            <Label htmlFor={titleId}>Title</Label>
            <Input
              id={titleId}
              name="title"
              defaultValue={data.note.title}
              required
              maxLength={titleMaxLength}
              aria-invalid={titleHasErrors || undefined}
              aria-describedby={titleErrorId}
              autoFocus
            />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList id={titleErrorId} errors={fieldErrors?.title} />
            </div>
          </div>
          <div>
            <Label htmlFor="content-input">Content</Label>
            <Textarea
              id="content-input"
              name="content"
              defaultValue={data.note.content}
              required
              maxLength={contentMaxLength}
              aria-invalid={contentHasErrors || undefined}
              aria-describedby={contentErrorId}
            />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList id={contentErrorId} errors={fieldErrors?.content} />
            </div>
          </div>
        </div>

        <div className="min-h-[32px] px-4 pb-4 pt-1">
          <ErrorList id={formErrorId} errors={formErrors} />
        </div>
      </Form>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset" form={formId}>
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
