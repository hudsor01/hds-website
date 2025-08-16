'use client';

import { Button } from '@/components/ui/Button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface SubmitButtonProps {
  isSubmitting: boolean;
  text?: string;
  loadingText?: string;
}

export function SubmitButton({ 
  isSubmitting, 
  text = 'Send Message',
  loadingText = 'Sending...'
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      loading={isSubmitting}
      loadingText={loadingText}
      fullWidth
      size="lg"
      icon={!isSubmitting && <ArrowRightIcon className="w-5 h-5" />}
      iconPosition="right"
    >
      {text}
    </Button>
  );
}