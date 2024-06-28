import os from 'node:os';
import { json, type LinksFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import fontStylesUrl from './styles/font.css?url';
import tailwindStylesUrl from './styles/tailwind.css?url';
import { getEnv } from './utils/env.server';

export const links: LinksFunction = () => {
  return [
    // { rel: 'icon', type: 'image/svg+xml', href: './favicon.svg' },
    { rel: 'stylesheet', href: fontStylesUrl },
    { rel: 'stylesheet', href: tailwindStylesUrl },
  ];
};

export async function loader() {
  return json({ username: os.userInfo().username, ENV: getEnv() });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* <link rel="icon" type="image/svg+xml" href="/favicon.svg" /> */}
        <Links />
      </head>
      <body>
        <Link to="/">Access Notes</Link>
        <hr />
        <div className="p-4">{children}</div>
        <hr />
        <Link to="/">Access Notes</Link>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV=${JSON.stringify(data.ENV)}`,
          }}
        ></script>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
