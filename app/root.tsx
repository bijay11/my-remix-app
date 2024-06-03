import { LinksFunction } from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import fontStylesUrl from './styles/font.css?url';
import tailwindStylesUrl from './styles/tailwind.css?url';

export const links: LinksFunction = () => {
  return [
    // { rel: 'icon', type: 'image/svg+xml', href: './favicon.svg' },
    { rel: 'stylesheet', href: fontStylesUrl },
    { rel: 'stylesheet', href: tailwindStylesUrl },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
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
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
