import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormSuccessMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function FormSuccessMessage({
  title,
  message,
  actionLabel = 'Submit another',
  onAction
}: FormSuccessMessageProps) {
  return (
    <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
      <div className="h-full py-6 px-3">
        <div className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2">
          <CheckCircle2 className="size-8 text-success-dark" />
        </div>
        <h2 className="text-center text-2xl text-pretty font-bold mb-2">
          {title}
        </h2>
        <p className="text-center text-lg text-pretty text-muted-foreground mb-4">
          {message}
        </p>
        {onAction && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
