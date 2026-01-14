import { Layout } from '@/components/layout/Layout';

export default function Terms() {
  return (
    <Layout>
      <section className="bg-cream py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold text-charcoal mb-8 animate-fade-up sm:text-5xl">
              Terms of <span className="text-gold-dark">Use</span>
            </h1>

            <div className="prose prose-stone max-w-none space-y-8 text-charcoal/70 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-base font-sans sm:text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the Maa Fusion Creations website and services, you acknowledge
                  that you have read, understood, and agree to be bound by these Terms of Use. If you
                  do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">2. Use of Content</h2>
                <p>
                  All content on this website, including but not limited to images, designs, renders,
                  text, graphics, and logos, is the exclusive property of Maa Fusion Creations and is
                  protected by copyright and intellectual property laws.
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>You may view and download content for personal, non-commercial use only.</li>
                  <li>Reproduction, distribution, or modification of any content without written permission is strictly prohibited.</li>
                  <li>Use of our designs for manufacturing or commercial purposes requires a valid license agreement.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">3. User Accounts</h2>
                <p>
                  To access certain features of our platform, you must create an account. You are
                  responsible for maintaining the confidentiality of your account credentials and for
                  all activities that occur under your account.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">4. Inquiries and Communications</h2>
                <p>
                  When submitting inquiries through our platform, you agree to provide accurate information.
                  We reserve the right to respond to inquiries at our discretion and are not obligated to
                  accept any project or commission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">5. Service & Payment Terms</h2>
                
                <h3 className="font-semibold text-charcoal text-lg mt-6">Design Revisions Policy</h3>
                <p>
                  We are committed to perfecting your vision. Your project includes <strong>two (2) complimentary design iterations</strong> or revisions after the initial concept.
                </p>
                <p className="italic text-charcoal/70">
                  Note: Any subsequent changes or additional iterations beyond these two will incur standard service charges.
                </p>

                <h3 className="font-semibold text-charcoal text-lg mt-6">Turnaround Time</h3>
                <p>
                  We strive for efficiency without compromising quality. Deliverables are typically provided within <strong>3 business days</strong> following payment confirmation.
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>Business Hours: Monday to Friday, 10:00 AM – 7:00 PM</li>
                  <li>We are closed on Sundays and Public Holidays.</li>
                </ul>

                <h3 className="font-semibold text-charcoal text-lg mt-6">File Delivery</h3>
                <p>
                  Final high-resolution files and project assets will be released exclusively upon <strong>confirmation of full payment</strong>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">6. Limitation of Liability</h2>
                <p>
                  Maa Fusion Creations shall not be liable for any indirect, incidental, special, or
                  consequential damages arising from your use of the website or services. Our total
                  liability shall not exceed the amount paid by you, if any, for access to our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">7. Modifications</h2>
                <p>
                  We reserve the right to modify these Terms of Use at any time. Changes will be
                  effective immediately upon posting. Your continued use of the website constitutes
                  acceptance of the modified terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">8. Contact</h2>
                <p>
                  For questions regarding these Terms of Use, please contact us at maafusioncreation76@gmail.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
