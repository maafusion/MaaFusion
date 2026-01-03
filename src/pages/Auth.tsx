import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { setRememberPreference, supabase } from "@/lib/supabaseClient";

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
  const [rememberMe, setRememberMe] = useState(true);
  const [isWhatsappSame, setIsWhatsappSame] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMode(paramMode);
  }, [paramMode]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const headline = useMemo(() => "Welcome to MaaFusion", []);

  const updateField = (name: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      phone: value,
      ...(isWhatsappSame ? { whatsapp: value } : {}),
    }));
  };

  const handleWhatsappSameToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsWhatsappSame(checked);
    if (checked) {
      setForm((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
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

    setRememberPreference(rememberMe);
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
    if (!firstName || !lastName || !email || !phone || !password) {
      toast({
        title: "Complete the form",
        description: "Please fill in all required fields to create your account.",
        variant: "destructive",
      });
      return;
    }
    const whatsappValue = isWhatsappSame ? phone : whatsapp;

    setRememberPreference(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          ...(whatsappValue ? { whatsapp: whatsappValue } : {}),
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

        <div className="relative container mx-auto flex justify-center px-6 py-24 lg:px-12 lg:py-28">
          <div className="mx-auto w-full max-w-xl rounded-3xl border border-gold/20 bg-white/80 p-8 text-center shadow-[0_30px_80px_-60px_rgba(55,44,31,0.6)] backdrop-blur">
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-white/70 px-4 py-1 text-xs font-sans uppercase tracking-[0.3em] text-charcoal/70">
                Client portal
              </span>
              <h1 className="text-4xl font-serif text-charcoal sm:text-5xl">{headline}</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-charcoal/60">
                {mode === "sign-in" ? "Sign in" : "Sign up"}
              </p>
            </div>

            <form className="mt-8 space-y-5 text-center" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                  <div className="grid gap-5 text-left sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        required
                        value={form.firstName}
                        onChange={updateField("firstName")}
                        placeholder="Aarav"
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
                        placeholder="Sharma"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="aarav.sharma@example.com"
                  />
                </div>

                {mode === "sign-up" && (
                  <div className="grid gap-5 text-left sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={form.phone}
                        onChange={handlePhoneChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp number (optional)</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        autoComplete="tel"
                        value={form.whatsapp}
                        onChange={updateField("whatsapp")}
                        disabled={isWhatsappSame}
                        placeholder="+91 98765 43210"
                      />
                      <label className="flex items-center gap-2 text-xs text-charcoal/70">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-charcoal/20 text-charcoal focus:ring-charcoal"
                          checked={isWhatsappSame}
                          onChange={handleWhatsappSameToggle}
                        />
                        Same as phone number
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      required
                      value={form.password}
                      onChange={updateField("password")}
                      placeholder="********"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 transition hover:text-charcoal"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === "sign-in" && (
                  <label className="flex items-center gap-2 text-left text-xs text-charcoal/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-charcoal/20 text-charcoal focus:ring-charcoal"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    Remember me
                  </label>
                )}

                <Button type="submit" variant="luxury" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "sign-in"
                      ? "Sign in to your account"
                      : "Create account and sign in"}
                </Button>

                {mode === "sign-in" ? (
                  <p className="text-xs text-charcoal/60">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("sign-up")}
                      className="font-semibold text-charcoal underline decoration-gold/60 underline-offset-4"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-charcoal/60">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("sign-in")}
                      className="font-semibold text-charcoal underline decoration-gold/60 underline-offset-4"
                    >
                      Sign in
                    </button>
                  </p>
                )}

                <p className="text-xs text-charcoal/60">
                  By continuing, you agree to MaaFusion&apos;s{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-charcoal underline decoration-gold/60 underline-offset-4"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-charcoal underline decoration-gold/60 underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
        </div>
      </section>
    </Layout>
  );
}
