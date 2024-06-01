import { useParams } from '@remix-run/react';

export default function UsersNotesIdRoute() {
  const { id } = useParams();
  return (
    <div>
      <h1>Note ID: {id}</h1>
      <p>This is the content of note with ID {id}.</p>
    </div>
  );
}
