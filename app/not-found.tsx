import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for has drifted out of orbit.</p>
      <Link className="button-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
