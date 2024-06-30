import {
  json,
  redirect,
  type LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod, getZodConstraint } from '@conform-to/zod';
import { getFormProps, useForm, getInputProps } from '@conform-to/react';
import { floatingToolbarClassName } from '#app/components/floating-toolbar';
import { Button } from '#app/components/ui/button';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import { Textarea } from '#app/components/ui/textarea';
import { db, updateNote } from '#app/utils/db.server';
import { invariantResponse, useIsSubmitting } from '#app/utils/misc';
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

const titleMaxLength = 100;
const contentMaxLength = 10000;

const NoteEditorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(titleMaxLength),
  content: z.string().min(1, 'Content is required').max(contentMaxLength),
});

export async function action({ request, params }: ActionFunctionArgs) {
  invariantResponse(params.noteId, 'noteId param is required');

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  });

  if (submission.status !== 'success') {
    return json({ status: 'error', submission } as const, {
      status: 400,
    });
  }

  const { title, content } = submission.value;

  await updateNote({ id: params.noteId, title, content });

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

export default function NoteEdit() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isSubmitting = useIsSubmitting();

  const [form, fields] = useForm({
    id: 'note-editor',
    constraint: getZodConstraint(NoteEditorSchema),
    lastResult: actionData?.submission.payload,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema });
    },
    defaultValue: {
      title: data.note.title,
      content: data.note.content,
    },
  });

  return (
    <div className="absolute inset-0">
      <Form
        method="POST"
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
        {...getFormProps(form)}
      >
        <div className="flex flex-col gap-1">
          <div>
            <Label htmlFor={fields.title.id}>Title</Label>
            <Input
              autoFocus
              {...getInputProps(fields.title, {
                type: 'text',
              })}
            />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList
                id={fields.title.errorId}
                errors={fields.title.errors}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={fields.content.id}>Content</Label>
            <Textarea {...getInputProps(fields.content, { type: 'text' })} />
            <div className="min-h-[32px] px-4 pb-4 pt-1">
              <ErrorList
                id={fields.content.errorId}
                errors={fields.content.errors}
              />
            </div>
          </div>
        </div>

        <div className="min-h-[32px] px-4 pb-4 pt-1">
          <ErrorList id={form.id} errors={form.errors} />
        </div>
      </Form>
      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset" form={form.id}>
          Reset
        </Button>
        <StatusButton
          type="submit"
          form={form.id}
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
