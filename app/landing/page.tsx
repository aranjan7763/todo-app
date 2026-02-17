import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <img src="/tasq-light.png" alt="Tasq" className="landing-logo-img" />
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-nav-link">
            Login
          </Link>
          <Link href="/login" className="landing-nav-link landing-nav-primary">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-headline">
            Nail the day, <span>just tasks, no clutter.</span>
          </h1>
          <p className="landing-secondary">
            Tasq — Your day, on a checklist.
          </p>
          <p className="landing-tertiary">
            A minimal, focused task manager that keeps you organized without
            getting in the way. Categories, profiles, dark mode — everything you
            need, nothing you don&apos;t.
          </p>
          <Link href="/login" className="landing-cta">
            Get Started Free &rarr;
          </Link>
        </div>
        <div className="landing-hero-image">
          <img src="/tasq-preview.png" alt="Tasq App Preview" />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features-container">
          <h2 className="landing-features-title">Why Tasq?</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <span className="material-icons">category</span>
              </div>
              <h3 className="landing-feature-title">Smart Categories</h3>
              <p className="landing-feature-desc">
                Organize tasks into color-coded categories. Filter, search, and
                find what matters instantly.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <span className="material-icons">dark_mode</span>
              </div>
              <h3 className="landing-feature-title">Dark & Light Mode</h3>
              <p className="landing-feature-desc">
                Easy on your eyes, day or night. One-tap theme switching that
                remembers your preference.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <span className="material-icons">person</span>
              </div>
              <h3 className="landing-feature-title">Your Profile</h3>
              <p className="landing-feature-desc">
                Personalize your workspace with a profile, avatar, social links,
                and bio — make it yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-bottom-cta">
        <h2>Ready to own your day?</h2>
        <p>Join Tasq and start checking things off.</p>
        <Link href="/login" className="landing-cta">
          Sign Up Now &rarr;
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Built with &#10084; by{" "}
          <a
            href="https://github.com/aranjan7763"
            target="_blank"
            rel="noopener noreferrer"
          >
            Amit
          </a>
        </p>
      </footer>
    </div>
  );
}
