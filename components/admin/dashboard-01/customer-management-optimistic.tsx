'use client'

import React, { useOptimistic, useTransition, startTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Edit, Save, X, User, Mail, Phone, Building } from 'lucide-react'

// React 19 optimistic action types
type Customer = {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'active' | 'inactive' | 'prospect'
  lastContact?: Date
}

type CustomerAction = 
  | { type: 'add'; customer: Customer }
  | { type: 'update'; id: string; customer: Partial<Customer> }
  | { type: 'delete'; id: string }
  | { type: 'revert'; id: string }

// Mock initial customers
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Michael Rodriguez',
    email: 'michael@dfwproperty.com',
    phone: '(214) 555-0123',
    company: 'DFW Property Management',
    status: 'active',
    lastContact: new Date('2024-01-15'),
  },
  {
    id: '2', 
    name: 'Sarah Chen',
    email: 'sarah.chen@enterprisesoft.com',
    phone: '(972) 555-0456',
    company: 'Enterprise Software Co.',
    status: 'active',
    lastContact: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'David Thompson',
    email: 'david@texasmfg.com',
    company: 'Texas Manufacturing Inc.',
    status: 'prospect',
    lastContact: new Date('2024-01-05'),
  },
]

// Server actions (simulated)
async function addCustomerAction(formData: FormData): Promise<Customer> {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  
  const customer: Customer = {
    id: Date.now().toString(),
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    status: 'prospect',
    lastContact: new Date(),
  }
  
  // Simulate potential failure
  if (Math.random() < 0.1) {
    throw new Error('Failed to add customer')
  }
  
  return customer
}

async function updateCustomerAction(id: string, updates: Partial<Customer>): Promise<Customer> {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  if (Math.random() < 0.1) {
    throw new Error('Failed to update customer')
  }
  
  return { ...initialCustomers.find(c => c.id === id)!, ...updates }
}

async function deleteCustomerAction(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  if (Math.random() < 0.1) {
    throw new Error('Failed to delete customer')
  }
}

// React 19 useOptimistic implementation
function useCustomersOptimistic() {
  const [customers, optimisticUpdate] = useOptimistic(
    initialCustomers,
    (state: Customer[], action: CustomerAction): Customer[] => {
      switch (action.type) {
        case 'add':
          return [...state, { ...action.customer, id: `temp-${Date.now()}` }]
        case 'update':
          return state.map(customer => 
            customer.id === action.id 
              ? { ...customer, ...action.customer }
              : customer,
          )
        case 'delete':
          return state.filter(customer => customer.id !== action.id)
        case 'revert':
          return state.filter(customer => customer.id !== action.id)
        default:
          return state
      }
    },
  )
  
  return [customers, optimisticUpdate] as const
}

// Enhanced form component with useFormStatus
function AddCustomerForm({ onSubmit }: { onSubmit: (formData: FormData) => void }) {
  const { pending } = useFormStatus()
  
  return (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Plus className='w-5 h-5' />
          Add New Customer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name *</Label>
            <Input
              id='name'
              name='name'
              required
              placeholder='John Doe'
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              name='email'
              type='email'
              required
              placeholder='john@example.com'
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input
              id='phone'
              name='phone'
              type='tel'
              placeholder='(555) 123-4567'
              disabled={pending}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='company'>Company</Label>
            <Input
              id='company'
              name='company'
              placeholder='Acme Corp'
              disabled={pending}
            />
          </div>
          <div className='col-span-1 md:col-span-2'>
            <Button type='submit' disabled={pending} className='w-full md:w-auto'>
              {pending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Adding Customer...
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Customer row component with inline editing
function CustomerRow({ 
  customer, 
  onUpdate, 
  onDelete, 
}: { 
  customer: Customer
  onUpdate: (id: string, updates: Partial<Customer>) => void
  onDelete: (id: string) => void 
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isPending, startTransition] = useTransition()
  const [editValues, setEditValues] = React.useState(customer)
  
  const isOptimistic = customer.id.startsWith('temp-')
  
  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCustomerAction(customer.id, editValues)
        onUpdate(customer.id, editValues)
        setIsEditing(false)
        toast.success('Customer updated successfully')
      } catch (error) {
        toast.error('Failed to update customer')
      }
    })
  }
  
  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCustomerAction(customer.id)
        onDelete(customer.id)
        toast.success('Customer deleted successfully')
      } catch (error) {
        toast.error('Failed to delete customer')
      }
    })
  }
  
  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <Card className={`${isOptimistic ? 'bg-yellow-50 border-yellow-200' : ''} ${isPending ? 'opacity-70' : ''}`}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 flex-1'>
            {isEditing ? (
              <>
                <Input
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  placeholder='Name'
                />
                <Input
                  value={editValues.email}
                  onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                  placeholder='Email'
                />
                <Input
                  value={editValues.phone || ''}
                  onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                  placeholder='Phone'
                />
                <Input
                  value={editValues.company || ''}
                  onChange={(e) => setEditValues({ ...editValues, company: e.target.value })}
                  placeholder='Company'
                />
              </>
            ) : (
              <>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span className='font-medium'>{customer.name}</span>
                  {isOptimistic && <Badge variant='secondary'>Pending</Badge>}
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>{customer.email}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>{customer.phone || 'N/A'}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Building className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>{customer.company || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
          
          <div className='flex items-center gap-2 ml-4'>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
            
            {isEditing ? (
              <>
                <Button size='sm' onClick={handleSave} disabled={isPending}>
                  <Save className='w-4 h-4' />
                </Button>
                <Button size='sm' variant='outline' onClick={() => setIsEditing(false)}>
                  <X className='w-4 h-4' />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size='sm' 
                  variant='outline' 
                  onClick={() => setIsEditing(true)}
                  disabled={isOptimistic || isPending}
                >
                  <Edit className='w-4 h-4' />
                </Button>
                <Button 
                  size='sm' 
                  variant='destructive' 
                  onClick={handleDelete}
                  disabled={isOptimistic || isPending}
                >
                  {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : <Trash2 className='w-4 h-4' />}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main customer management component
export function CustomerManagementOptimistic() {
  const [customers, optimisticUpdate] = useCustomersOptimistic()
  const [isPending, startTransition] = useTransition()
  
  const handleAddCustomer = (formData: FormData) => {
    const newCustomer: Customer = {
      id: `temp-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      status: 'prospect',
      lastContact: new Date(),
    }
    
    // Optimistic update
    optimisticUpdate({ type: 'add', customer: newCustomer })
    
    startTransition(async () => {
      try {
        const confirmedCustomer = await addCustomerAction(formData)
        // Replace temporary customer with confirmed one
        optimisticUpdate({ type: 'update', id: newCustomer.id, customer: confirmedCustomer })
        toast.success('Customer added successfully')
        
        // Reset form
        const form = document.querySelector('form') as HTMLFormElement
        form?.reset()
      } catch (error) {
        optimisticUpdate({ type: 'revert', id: newCustomer.id })
        toast.error('Failed to add customer')
      }
    })
  }
  
  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    optimisticUpdate({ type: 'update', id, customer: updates })
  }
  
  const handleDeleteCustomer = (id: string) => {
    optimisticUpdate({ type: 'delete', id })
  }
  
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Customer Management</h1>
        <Badge variant='secondary'>
          {customers.length} Customer{customers.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <AddCustomerForm onSubmit={handleAddCustomer} />
      
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Customers</h2>
        {customers.map((customer) => (
          <CustomerRow
            key={customer.id}
            customer={customer}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
          />
        ))}
        
        {customers.length === 0 && (
          <Card>
            <CardContent className='text-center py-12'>
              <p className='text-gray-500'>No customers found. Add your first customer above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}