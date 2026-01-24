import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'number' | 'tel';
  placeholder?: string;
  className?: string;
  step?: string;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder,
  className,
  step,
}: FormFieldProps) {
  return (
    <div className="space-y-tight">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          error && 'border-destructive border-2',
          className
        )}
        placeholder={placeholder}
        aria-invalid={!!error}
        step={step}
      />
      {error && (
        <p className="text-destructive text-xs" role="alert">{error}</p>
      )}
    </div>
  );
}
