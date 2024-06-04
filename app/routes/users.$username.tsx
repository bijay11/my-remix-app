import { Link, useParams } from '@remix-run/react';

export default function UsernameRoute() {
  const { username } = useParams();
  return (
    <div>
      <h1>
        <strong>{username}</strong>
      </h1>
      <Link to="notes">Notes</Link>
    </div>
  );
}
