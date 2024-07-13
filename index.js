import { installGlobals } from '@remix-run/node';
installGlobals();

if (process.env.NODE_ENV === 'production') {
  await import('./server-build/index.js');
} else {
  process.env.TESTING = 'true';
  await import('./server/index.ts');
}
