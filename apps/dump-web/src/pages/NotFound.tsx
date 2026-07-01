import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <Helmet>
        <title>404 Not Found | Dump</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center">
        <h1 className="font-mono text-7xl font-bold text-[var(--text-primary)]">404</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          This clipboard doesn't exist or has expired.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
