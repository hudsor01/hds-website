/**
 * Contact Server Actions
 * 
 * Next.js 15 Server Actions for contact form handling
 * Replaces tRPC mutations with native Next.js functionality
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { supabaseAdmin, type ContactInsert } from '@/lib/supabase';

// Form validation schemas
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  service: z.string().optional(),
  source: z.string().optional().default('contact-form'),
});

const updateContactStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'UNRESPONSIVE']),
});

// Server Actions
export async function submitContactForm(formData: FormData) {
  try {
    // Parse and validate form data
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string || undefined,
      message: formData.get('message') as string,
      service: formData.get('service') as string || undefined,
      source: formData.get('source') as string || 'contact-form',
    };

    const validated = contactSchema.parse(rawData);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        ...validated,
        status: 'NEW',
      } as ContactInsert)
      .select()
      .single();

    if (error) {
      console.error('Contact submission error:', error);
      return { 
        success: false, 
        error: 'Failed to submit contact form. Please try again.' 
      };
    }

    // TODO: Send email notification
    // await sendContactNotification(data);

    // Revalidate admin pages
    revalidatePath('/admin/contacts');
    revalidatePath('/admin');

    return { 
      success: true, 
      data,
      message: 'Thank you! Your message has been sent successfully.' 
    };

  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Please check your form inputs and try again.',
        fieldErrors: error.flatten().fieldErrors 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}

export async function updateContactStatus(formData: FormData) {
  try {
    const rawData = {
      id: formData.get('id') as string,
      status: formData.get('status') as string,
    };

    const validated = updateContactStatusSchema.parse(rawData);

    const { error } = await supabaseAdmin
      .from('contacts')
      .update({ 
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.id);

    if (error) {
      console.error('Status update error:', error);
      return { 
        success: false, 
        error: 'Failed to update contact status.' 
      };
    }

    // Revalidate admin pages
    revalidatePath('/admin/contacts');
    revalidatePath('/admin');

    return { 
      success: true,
      message: 'Contact status updated successfully.' 
    };

  } catch (error) {
    console.error('Status update error:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid input provided.' 
      };
    }

    return { 
      success: false, 
      error: 'An unexpected error occurred.' 
    };
  }
}

export async function deleteContact(contactId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      console.error('Delete contact error:', error);
      return { 
        success: false, 
        error: 'Failed to delete contact.' 
      };
    }

    // Revalidate admin pages
    revalidatePath('/admin/contacts');
    revalidatePath('/admin');

    return { 
      success: true,
      message: 'Contact deleted successfully.' 
    };

  } catch (error) {
    console.error('Delete contact error:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred.' 
    };
  }
}