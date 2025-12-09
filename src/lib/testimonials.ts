/**
 * Testimonials Server Functions
 * Server-side functions for managing testimonials and testimonial requests
 * Note: Types and constants are in ./testimonials/types.ts for client component compatibility
 */

import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import type { ServiceType, Testimonial, TestimonialRequest } from '../types/testimonials';

export type { ServiceType, Testimonial, TestimonialRequest };

/**
 * Generate a cryptographically secure unique token for testimonial requests
 * Uses Node.js crypto.randomBytes for secure random generation
 */
export function generateToken(): string {
  return randomBytes(24).toString('hex');
}

/**
 * Get a testimonial request by token
 */
export async function getTestimonialRequestByToken(token: string): Promise<TestimonialRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonial_requests')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) {
    return null;
  }

  return data as TestimonialRequest;
}

/**
 * Create a new testimonial request (private link)
 */
export async function createTestimonialRequest(
  clientName: string,
  clientEmail?: string,
  projectName?: string,
  expiresInDays: number = 30
): Promise<TestimonialRequest | null> {
  const supabase = await createClient();
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('testimonial_requests')
    .insert({
      token,
      client_name: clientName,
      client_email: clientEmail || null,
      project_name: projectName || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as TestimonialRequest;
}

/**
 * Get all testimonial requests
 */
export async function getTestimonialRequests(): Promise<TestimonialRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonial_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as TestimonialRequest[];
}

/**
 * Mark a testimonial request as submitted
 */
export async function markRequestSubmitted(token: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('testimonial_requests')
    .update({
      submitted: true,
      submitted_at: new Date().toISOString(),
    })
    .eq('token', token);

  return !error;
}

/**
 * Submit a testimonial
 */
export async function submitTestimonial(testimonial: {
  request_id?: string;
  client_name: string;
  company?: string;
  role?: string;
  rating: number;
  content: string;
  photo_url?: string;
  video_url?: string;
  service_type?: string;
}): Promise<Testimonial | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      request_id: testimonial.request_id || null,
      client_name: testimonial.client_name,
      company: testimonial.company || null,
      role: testimonial.role || null,
      rating: testimonial.rating,
      content: testimonial.content,
      photo_url: testimonial.photo_url || null,
      video_url: testimonial.video_url || null,
      service_type: testimonial.service_type || null,
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as Testimonial;
}

/**
 * Get all testimonials (for admin)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Testimonial[];
}

/**
 * Get approved testimonials (for public display)
 */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Testimonial[];
}

/**
 * Update testimonial status (approve/feature)
 */
export async function updateTestimonialStatus(
  id: string,
  updates: { approved?: boolean; featured?: boolean }
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id);

  return !error;
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  return !error;
}

/**
 * Delete a testimonial request
 */
export async function deleteTestimonialRequest(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('testimonial_requests')
    .delete()
    .eq('id', id);

  return !error;
}
