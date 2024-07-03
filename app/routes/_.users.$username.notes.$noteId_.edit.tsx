import {
  json,
  redirect,
  type LoaderFunctionArgs,
  ActionFunctionArgs,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
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
import { cn, invariantResponse, useIsSubmitting } from '#app/utils/misc';
import { StatusButton } from '#app/components/ui/status-button.js';
import { GeneralErrorBoundary } from '#app/components/error-boundary.js';
import { useState } from 'react';

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
      images: note.images.map((image) => ({
        id: image.id,
        altText: image.altText,
      })),
    },
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

  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({
      maxPartSize: 1024 * 1024 * 3,
    })
  );

  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  });

  if (submission.status !== 'success') {
    return json({ status: 'error', submission } as const, {
      status: 400,
    });
  }

  const { title, content } = submission.value;

  await updateNote({
    id: params.noteId,
    title,
    content,
    images: [
      {
        id: formData.get('imageId') ?? '',
        file: formData.get('file') ?? null,
        altText: formData.get('altText') ?? null,
      },
    ],
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
        encType="multipart/form-data"
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
          <div>
            <Label>Image</Label>
            <ImageChooser image={data.note.images[0]} />
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

function ImageChooser({
  image,
}: {
  image?: { id: string; altText?: string | null };
}) {
  const existingImage = Boolean(image);
  const [previewImage, setPreviewImage] = useState<string | null>(
    existingImage ? `/resources/images/${image?.id}` : null
  );

  const [altText, setAltText] = useState<string>(image?.altText ?? '');

  return (
    <fieldset>
      <div className="flex gap-3">
        <div className="w-32">
          <div className="relative h-32 w-32">
            <label
              htmlFor="image-input"
              className={cn('group absolute h-32 w-32 rounded-lg', {
                'bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100':
                  !previewImage,
                'cursor-pointer focus-within:ring-4': !existingImage,
              })}
            >
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt={altText ?? ''}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  {existingImage ? null : (
                    <div className="pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-md">
                      new
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-muted-foreground text-4xl text-muted-foreground">
                  ➕
                </div>
              )}
              {existingImage && (
                <input type="hidden" name="imageId" value={image?.id} />
              )}
              <input
                id="image-input"
                aria-label="Image"
                className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setPreviewImage(null);
                  }
                }}
                name="file"
                type="file"
                accept="image/*"
              />
            </label>
          </div>
        </div>
        <div className="flex-1">
          <Label htmlFor="alt-text">Alt Text</Label>
          <Textarea
            id="alt-text"
            name="altText"
            defaultValue={altText}
            onChange={(e) => setAltText(e.currentTarget.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
