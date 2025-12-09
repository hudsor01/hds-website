import React from 'react'

export const PayStubFooter: React.FC = () => {
  return (
    <div className="mt-heading text-muted-foreground border-t border-border pt-2.5">
      <div className="text-center">
        This statement is for informational purposes only and does not constitute an official document.
        <br/>
        Please retain this statement for your records.
      </div>
    </div>
  )
}