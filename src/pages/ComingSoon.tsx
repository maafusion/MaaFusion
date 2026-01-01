import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
    return (
        <Layout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream px-4 text-center">
                <h1 className="font-serif text-5xl md:text-7xl text-charcoal mb-6 animate-fade-up">
                    Coming Soon
                </h1>
                <div className="h-px w-24 bg-gold/50 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }} />
                <p className="font-sans text-charcoal/60 text-lg max-w-md mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                    We are currently crafting this experience. Please check back shortly for updates.
                </p>
                <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
                    <Button variant="outline" asChild className="rounded-none border-charcoal/20 hover:bg-charcoal hover:text-cream transition-all duration-300">
                        <Link to="/">Return Home</Link>
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
