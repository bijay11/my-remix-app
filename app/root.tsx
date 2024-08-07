import os from 'node:os';
import {
  type ActionFunctionArgs,
  type LinksFunction,
  json,
} from '@remix-run/node';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  LiveReload,
} from '@remix-run/react';
import fontStylesUrl from './styles/font.css?url';
import tailwindStylesUrl from './styles/tailwind.css?url';
import { getEnv } from './utils/env.server';
import { GeneralErrorBoundary } from './components/error-boundary';
import { honeypot } from './utils/honeypot.server';
import { HoneypotProvider } from 'remix-utils/honeypot/react';
import { csrf } from './utils/csrf.server';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: fontStylesUrl },
    { rel: 'stylesheet', href: tailwindStylesUrl },
  ];
};

export async function loader({ request }: ActionFunctionArgs) {
  const honeyProps = honeypot.getInputProps();
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);
  return json(
    { username: os.userInfo().username, ENV: getEnv(), honeyProps, csrfToken },
    {
      headers: csrfCookieHeader
        ? {
            'set-cookie': csrfCookieHeader,
          }
        : {},
    }
  );
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col justify-between bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <Document>
      <header className="container mx-auto py-6">
        <nav className="flex justify-between">
          <Link to="/">Access Notes</Link>
          <Link to="/users/johndoe">John Doe</Link>
        </nav>
      </header>

      <div className="p-4 flex-1">
        <Outlet />
      </div>

      <div className="h-5" />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
    </Document>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <HoneypotProvider {...data.honeyProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
