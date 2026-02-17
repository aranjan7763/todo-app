"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setLoginError(
          "Please verify your email before logging in. Check your inbox."
        );
      } else {
        setLoginError(error.message);
      }
      setLoginLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }

    setSignupLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setSignupError(error.message);
      setSignupLoading(false);
      return;
    }

    setSentEmail(signupEmail);
    setEmailSent(true);
    setSignupLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-content">
          <div className="auth-card auth-card-email">
            <div className="email-icon">
              <span className="material-icons" style={{ fontSize: 48 }}>
                mark_email_read
              </span>
            </div>
            <h1>Check Your Email</h1>
            <p className="email-msg">
              We sent a verification link to <strong>{sentEmail}</strong>. Click
              the link in the email to verify your account, then come back to log
              in.
            </p>
            <button
              className="auth-btn auth-btn-login"
              onClick={() => setEmailSent(false)}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <a href="/landing" className="auth-back-link">
        <span className="material-icons">arrow_back</span>
        Back
      </a>

      <div className="auth-content">
        <div className="auth-branding">
          <img src="/tasq-dark.png" alt="Tasq" className="auth-logo" />
          <p className="auth-tagline">Your day, on a checklist</p>
        </div>
        <div className="auth-cards-row">
          {/* Signup Card */}
          <div className="auth-card auth-card-signup">
            <h1>Create your account</h1>
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <div className="auth-input-wrap">
                  <span className="material-icons auth-input-icon">email</span>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="auth-input-wrap">
                  <span className="material-icons auth-input-icon">lock</span>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    placeholder="Password (min 6 chars)"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="auth-input-wrap">
                  <span className="material-icons auth-input-icon">lock</span>
                  <input
                    type="password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {signupError && <div className="auth-error">{signupError}</div>}

              <button
                type="submit"
                disabled={signupLoading}
                className="auth-btn auth-btn-signup"
              >
                {signupLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
          </div>

          {/* OR Divider */}
          <div className="auth-or-divider">
            <span>OR</span>
          </div>

          {/* Login Card */}
          <div className="auth-card auth-card-login">
            <h1>Welcome back</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <div className="auth-input-wrap">
                  <span className="material-icons auth-input-icon">email</span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="auth-input-wrap">
                  <span className="material-icons auth-input-icon">lock</span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Your password"
                  />
                </div>
              </div>

              {loginError && <div className="auth-error">{loginError}</div>}

              <button
                type="submit"
                disabled={loginLoading}
                className="auth-btn auth-btn-login"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* Google Sign-In Section */}
        <div className="auth-google-section">
          <div className="auth-google-divider">
            <span>OR CONTINUE WITH</span>
          </div>
          <button
            className="auth-google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            {googleLoading ? "Redirecting..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
