// Utility functions for formatting

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US').format(new Date(dateString))
}