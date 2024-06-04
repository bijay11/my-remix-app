import { useParams } from '@remix-run/react';

export default function SomeNoteId() {
  const { noteId } = useParams();
  return (
    <>
      <h2>{noteId}</h2>
    </>
  );
}
