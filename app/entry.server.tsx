import { type HandleDocumentRequestFunction } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { getEnv } from './utils/env.server';

global.ENV = getEnv();

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>;

export default function handleRequest(...args: DocRequestArgs) {
  const [request, responseStatusCode, responseHeaders, remixContent] = args;
  const markup = renderToString(
    <RemixServer context={remixContent} url={request.url} />
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
