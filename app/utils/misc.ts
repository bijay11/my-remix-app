import { useFormAction, useNavigation } from '@remix-run/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TODO: fix this
// import userFallback from '#app/assets/user.png';

export function getUserImgSrc(imageId?: string | null) {
  return imageId ? `/resources/user-images/${imageId}` : '';
}

export function getNoteImgSrc(imageId: string) {
  return `/resources/note-images/${imageId}`;
}

/**
 * A handy utility that makes constructing class names easier.
 * It also merges tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === 'function'
        ? message()
        : message || 'An invariant failed, please provide a message',
      { status: 400, ...responseInit }
    );
  }
}

/**
 * Returns a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  console.log('Unable to get error message for the error', error);
  return 'Unknown Error';
}

export function useIsSubmitting({
  formAction,
  formMethod = 'POST',
}: {
  formAction?: string;
  formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
} = {}) {
  const contextualFormAction = useFormAction();
  const navigation = useNavigation();

  return (
    navigation.state === 'submitting' &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  );
}
