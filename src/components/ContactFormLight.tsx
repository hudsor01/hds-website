'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContactFormStore } from '@/stores/form';
import { contactFormSchema, type ContactFormData } from '@/schemas/contact';
import { useContactMutation } from '@/hooks/api/useContactMutation';
// Optimized: Single icon import to reduce bundle size
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

// Import smaller components
import { FormField } from './contact/FormField';
import { LightFormSelect } from './contact/LightFormSelect';
import { FormTextArea } from './contact/FormTextArea';
import { SubmitButton } from './contact/SubmitButton';
import { SuccessMessage } from './contact/SuccessMessage';
import { ErrorMessage } from './contact/ErrorMessage';
import { serviceOptions, budgetOptions } from './contact/formOptions';

export default function ContactFormLight() {
  const { 
    isSubmitted, 
    setSubmitted, 
    updateData, 
    resetForm: resetStore 
  } = useContactFormStore();
  
  // React Query mutation for contact form
  const contactMutation = useContactMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      service: undefined,
      budget: undefined,
      timeline: undefined,
      message: '',
    },
  });
  
  // Watch form data and sync with Zustand store
  const formData = watch();
  updateData(formData);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactMutation.mutateAsync(data);
      setSubmitted(true);
      reset();
      resetStore();
    } catch (error) {
      // React Query handles error state automatically
      // Error will be shown via contactMutation.isError below
      console.error('Contact form submission failed:', error);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    reset();
  };

  if (isSubmitted) {
    return <SuccessMessage onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 fade-in">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          placeholder="John"
          required
          error={errors.firstName?.message}
          register={register}
          variant="glass"
          icon={<UserIcon className="w-5 h-5" />}
        />
        <FormField
          label="Last Name"
          name="lastName"
          placeholder="Doe"
          required
          error={errors.lastName?.message}
          register={register}
          variant="glass"
          icon={<UserIcon className="w-5 h-5" />}
        />
      </div>

      {/* Email */}
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="john@example.com"
        required
        error={errors.email?.message}
        register={register}
        variant="glass"
        icon={<EnvelopeIcon className="w-5 h-5" />}
      />

      {/* Phone and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          register={register}
          variant="glass"
          icon={<PhoneIcon className="w-5 h-5" />}
        />
        <FormField
          label="Company"
          name="company"
          placeholder="Acme Corp"
          register={register}
          variant="glass"
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
        />
      </div>

      {/* Service and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LightFormSelect
          label="Service Needed"
          name="service"
          options={serviceOptions}
          register={register}
        />
        <LightFormSelect
          label="Project Budget"
          name="budget"
          options={budgetOptions}
          register={register}
        />
      </div>

      {/* Timeline */}
      <FormField
        label="Project Timeline"
        name="timeline"
        placeholder="e.g., 3 months, ASAP, Q1 2024"
        register={register}
        variant="glass"
        icon={<ClockIcon className="w-5 h-5" />}
      />

      {/* Message */}
      <FormTextArea
        label="Project Details"
        name="message"
        placeholder="Tell us about your project goals, challenges, and vision..."
        required
        error={errors.message?.message}
        register={register}
        variant="glass"
        icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />}
        maxLength={1000}
        description="Describe your project vision and requirements"
      />

      {/* Submit Button */}
      <SubmitButton isSubmitting={contactMutation.isPending} />

      {/* Form Validation Error Message */}
      {errors.root?.message && <ErrorMessage message={errors.root.message} />}
      
      {/* React Query Error Message */}
      {contactMutation.isError && (
        <ErrorMessage 
          message={contactMutation.error?.message || 'Failed to send message. Please try again.'} 
        />
      )}
    </form>
  );
}