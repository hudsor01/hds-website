import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  step?: string;
}

export function CurrencyInput({
  label,
  id,
  value,
  onChange,
  error,
  required,
  placeholder = '0.00',
  className,
  step = '0.01',
}: CurrencyInputProps) {
  return (
    <div className="space-y-tight">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          id={id}
          type="number"
          step={step}
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          variant="currency"
          className={cn(error && 'border-destructive border-2', className)}
          placeholder={placeholder}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="text-destructive text-xs" role="alert">{error}</p>
      )}
    </div>
  );
}
