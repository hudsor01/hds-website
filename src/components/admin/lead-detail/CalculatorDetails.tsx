import type { Lead } from './types';

interface CalculatorDetailsProps {
  lead: Lead;
}

export function CalculatorDetails({ lead }: CalculatorDetailsProps) {
  const calculatorName = lead.calculator_type
    .replace('-', ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-content">
      <h3 className="text-lg font-semibold">{calculatorName} Details</h3>
      <div className="grid gap-content sm:grid-cols-2">
        <div className="rounded-lg border card-padding-sm">
          <h4 className="mb-3 font-medium">Calculator Inputs</h4>
          <dl className="space-y-tight">
            {Object.entries(lead.inputs).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </dt>
                <dd className="font-medium">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-lg border card-padding-sm">
          <h4 className="mb-3 font-medium">Calculator Results</h4>
          <dl className="space-y-tight">
            {Object.entries(lead.results).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{key}:</dt>
                <dd className="font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
