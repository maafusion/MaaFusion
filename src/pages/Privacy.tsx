import { Layout } from '@/components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <section className="bg-cream py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold text-charcoal mb-8 animate-fade-up sm:text-5xl">
              Privacy <span className="text-gold-dark">Policy</span>
            </h1>

            <div className="prose prose-stone max-w-none space-y-8 text-charcoal/70 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-base font-sans sm:text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>Name, email address, and phone number when you create an account</li>
                  <li>Contact information when you submit inquiries</li>
                  <li>Address and additional details you add to your profile</li>
                  <li>Communications you have with us</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>Provide and maintain our services</li>
                  <li>Respond to your inquiries and requests</li>
                  <li>Send you updates about our designs and services</li>
                  <li>Improve our website and user experience</li>
                  <li>Protect against unauthorized access and fraud</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal information against unauthorized access, alteration, disclosure, or
                  destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">5. Your Rights</h2>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-gold-dark">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">6. Cookies</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience on our website.
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">7. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your rights,
                  please contact us at privacy@maafusion.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
