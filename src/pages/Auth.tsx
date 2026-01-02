import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "sign-in" | "sign-up";

const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  whatsapp: "",
  password: "",
};

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const paramMode = searchParams.get("mode") === "sign-up" ? "sign-up" : "sign-in";
  const [mode, setMode] = useState<AuthMode>(paramMode);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(paramMode);
  }, [paramMode]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const headline = useMemo(
    () => (mode === "sign-in" ? "Welcome back to MaaFusion." : "Create your MaaFusion account."),
    [mode],
  );

  const subcopy = useMemo(
    () =>
      mode === "sign-in"
        ? "Access your studio updates, saved inspiration, and project details in one place."
        : "Join the studio to track inquiries, save inspiration, and manage your project journey.",
    [mode],
  );

  const updateField = (name: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const setAuthMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode });
  };

  const handleSignIn = async () => {
    const { email, password } = form;
    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter your email and password to continue.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Signed in",
      description: "Welcome back. Redirecting you now.",
    });
    navigate("/", { replace: true });
  };

  const handleSignUp = async () => {
    const { firstName, lastName, email, phone, whatsapp, password } = form;
    if (!firstName || !lastName || !email || !phone || !whatsapp || !password) {
      toast({
        title: "Complete the form",
        description: "Please fill in all fields to create your account.",
        variant: "destructive",
      });
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          whatsapp,
        },
      },
    });

    if (signUpError) {
      toast({
        title: "Sign up failed",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      toast({
        title: "Almost there",
        description: "Check your email to confirm your account before signing in.",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "You're signed in and ready to explore.",
    });
    navigate("/", { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (mode === "sign-in") {
        await handleSignIn();
      } else {
        await handleSignUp();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_55%)]" />
        </div>

        <div className="relative container mx-auto px-6 py-24 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-4 py-1 text-xs font-sans uppercase tracking-[0.3em] text-charcoal/70">
                Client portal
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-serif text-charcoal sm:text-5xl">{headline}</h1>
                <p className="max-w-xl text-base text-charcoal/70 sm:text-lg">{subcopy}</p>
              </div>
              <div className="grid gap-4 text-sm text-charcoal/70 sm:grid-cols-2">
                <div className="rounded-2xl border border-gold/20 bg-white/70 p-4 backdrop-blur">
                  <p className="font-medium text-charcoal">Streamlined collaboration</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal/50">Centralize details</p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-white/70 p-4 backdrop-blur">
                  <p className="font-medium text-charcoal">Saved inspiration</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal/50">Build your moodboard</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-white/80 p-8 shadow-[0_30px_80px_-60px_rgba(55,44,31,0.6)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Secure access</p>
                  <h2 className="text-2xl font-serif text-charcoal">
                    {mode === "sign-in" ? "Sign in" : "Sign up"}
                  </h2>
                </div>
                <div className="flex rounded-full border border-charcoal/10 bg-cream/60 p-1 text-xs font-semibold uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => setAuthMode("sign-in")}
                    className={`rounded-full px-4 py-2 transition-all ${mode === "sign-in"
                        ? "bg-charcoal text-cream shadow-sm"
                        : "text-charcoal/60 hover:text-charcoal"
                      }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("sign-up")}
                    className={`rounded-full px-4 py-2 transition-all ${mode === "sign-up"
                        ? "bg-charcoal text-cream shadow-sm"
                        : "text-charcoal/60 hover:text-charcoal"
                      }`}
                  >
                    SIGN UP
                  </button>
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {mode === "sign-up" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        required
                        value={form.firstName}
                        onChange={updateField("firstName")}
                        placeholder="Ava"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        required
                        value={form.lastName}
                        onChange={updateField("lastName")}
                        placeholder="Brooks"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="you@email.com"
                  />
                </div>

                {mode === "sign-up" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={form.phone}
                        onChange={updateField("phone")}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp number</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={form.whatsapp}
                        onChange={updateField("whatsapp")}
                        placeholder="(555) 222-1133"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    required
                    value={form.password}
                    onChange={updateField("password")}
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "sign-in"
                      ? "Sign in to your account"
                      : "Create account and sign in"}
                </Button>

                <p className="text-xs text-charcoal/60">
                  By continuing, you agree to MaaFusion&apos;s Terms and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
