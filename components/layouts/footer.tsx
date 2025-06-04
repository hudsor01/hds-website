'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { 
FadeIn, 
SlideIn, 
ScaleIn, 
AnimatedText,
StaggerContainer,
} from '@/components/animated/motion-wrapper'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type NewsletterFormValues = z.infer<typeof newsletterSchema>

const navigation = {
  solutions: [
    { name: 'Revenue Operations', href: '/services/revenue-operations' },
    { name: 'Web Development', href: '/services/web-development' },
    { name: 'Data Analytics', href: '/services/data-analytics' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Case Studies', href: '/case-studies' },
  ],
  support: [
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:hello@hudsondigitalsolutions.com',
      icon: Mail,
    },
  ],
}

export function Footer() {
  const { toast } = useToast()
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  })

  const newsletterMutation = api.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      })
      form.reset()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: NewsletterFormValues) => {
    newsletterMutation.mutate(data)
  }

  return (
    <footer className='bg-surface border-t border-neutral-200' aria-labelledby='footer-heading'>
      <h2 id='footer-heading' className='sr-only'>
        Footer
      </h2>
      <div className='mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32'>
        <StaggerContainer className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <FadeIn className='space-y-8'>
            <AnimatedText className='text-xl font-bold brand-text-gradient'>
              <Link href='/'>
                Hudson Digital Solutions
              </Link>
            </AnimatedText>
            <AnimatedText as='p' className='text-sm leading-6 text-neutral-600' delay={0.1}>
              Transform your business with modern technology solutions. We
              specialize in revenue operations, web development, and data analytics
              for small businesses in Dallas-Fort Worth.
            </AnimatedText>
            <StaggerContainer className='flex space-x-6 logical-margin' staggerDelay={0.1}>
              {navigation.social.map((item, index) => (
                <ScaleIn key={item.name} delay={0.2 + index * 0.1}>
                  <a
                    href={item.href}
                    className='text-neutral-500 hover:text-brand-600 smooth-transition'
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    <span className='sr-only'>{item.name}</span>
                    <item.icon className='h-6 w-6' aria-hidden='true' />
                  </a>
                </ScaleIn>
              ))}
            </StaggerContainer>
          </FadeIn>
          <SlideIn direction='up' delay={0.3} className='mt-16 dynamic-grid xl:col-span-2 xl:mt-0'>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold leading-6 text-foreground'>
                  Services
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  {navigation.solutions.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className='text-sm leading-6 text-neutral-600 hover:text-brand-600 smooth-transition'
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='mt-10 md:mt-0'>
                <h3 className='text-sm font-semibold leading-6 text-foreground'>
                  Company
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  {navigation.company.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className='text-sm leading-6 text-neutral-600 hover:text-brand-600 smooth-transition'
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold leading-6 text-foreground'>
                  Support
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  {navigation.support.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className='text-sm leading-6 text-neutral-600 hover:text-brand-600 smooth-transition'
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SlideIn>

        <FadeIn delay={0.5} className='mt-16 border-t border-neutral-200 pt-8'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-foreground'>
                Subscribe to our newsletter
              </h3>
              <p className='mt-2 text-sm leading-6 text-neutral-600'>
                Get the latest updates on business automation and growth strategies.
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='mt-4 sm:flex sm:max-w-md'
                >
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Enter your email'
                            className='bg-background border-neutral-300 focus:border-brand-500 focus:ring-brand-500'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0'>
                    <Button
                      type='submit'
                      disabled={newsletterMutation.isPending}
                      className='premium-button bg-brand-600 text-white hover:bg-brand-700 hover-lift w-full'
                    >
                      Subscribe
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </FadeIn>

        </StaggerContainer>

        <FadeIn delay={0.6} className='mt-8 border-t border-neutral-200 pt-8'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <AnimatedText as='p' className='text-xs leading-5 text-neutral-500'>
              &copy; {new Date().getFullYear()} Hudson Digital Solutions. All rights reserved.
            </AnimatedText>
            <AnimatedText as='p' className='text-xs leading-5 text-neutral-500' delay={0.1}>
              Dallas-Fort Worth, Texas | Revenue Operations & Web Development
            </AnimatedText>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}