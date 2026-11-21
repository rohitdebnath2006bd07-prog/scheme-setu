import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default function NotFound() {
  const t = getTranslations({ namespace: "common" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-lg text-slate-600 mb-8">Page not found</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium"
      >
        Go home
      </Link>
    </div>
  );
}