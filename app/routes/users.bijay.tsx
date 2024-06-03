import { Link } from '@remix-run/react';

export default function UsersBijayRoute() {
  return (
    <div>
      <h1>
        <strong>Bijay</strong>
      </h1>
      <Link to="notes">Notes</Link>
    </div>
  );
}
