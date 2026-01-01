import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MapPin, Phone, Mail, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: 'Mumbai, Maharashtra, India',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+91 98765 43210',
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: 'hello@maafusion.com',
  },
];

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);

    // Simulate form submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);

    // For now, just show success message
    // TODO: Integrate with email service or backend API
    toast({
      title: 'Message Sent!',
      description: "Thank you for reaching out. We'll get back to you soon.",
    });

    form.reset();
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-charcoal to-background" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
              Get in <span className="text-gold-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Have a question or want to discuss a project? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Contact <span className="text-gold-gradient">Information</span>
              </h2>

              <div className="space-y-6 mb-12">
                {contactInfo.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-luxury p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Business Hours
                </h3>
                <div className="space-y-1 text-muted-foreground text-sm">
                  <p>Monday - Friday: 10:00 AM - 7:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-luxury p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Send a Message
              </h2>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      {...form.register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project or inquiry..."
                    rows={5}
                    {...form.register('message')}
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <Button type="submit" variant="luxury" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
