import { forwardRef } from 'react';
import { Button, type ButtonProps } from './button';
import { cn } from '#app/utils/misc.js';

type ButtonStatus = 'pending' | 'success' | 'error' | 'idle';

export const StatusButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { status: ButtonStatus }
>(({ status = 'idle', className, children, ...props }, ref) => {
  const companion = {
    pending: <span className="inline-block animate-spin">🌀</span>,
    success: <span>✅</span>,
    error: <span>❌</span>,
    idle: null,
  }[status];
  return (
    <Button
      ref={ref}
      className={cn('flex justify-center gap-4', className)}
      {...props}
    >
      <div>{children}</div>
      {companion}
    </Button>
  );
});

StatusButton.displayName = 'Button';
