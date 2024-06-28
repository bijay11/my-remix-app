import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { type ErrorResponse } from '@remix-run/router';
import { getErrorMessage } from '#app/utils/misc';

type Info = {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
};

type StatusHandler = (info: Info) => JSX.Element | null;

type GeneralErrorBoundaryProps = {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
};

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: GeneralErrorBoundaryProps) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== 'undefined') {
    console.log(error);
  }

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}
