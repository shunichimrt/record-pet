import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-900">Record Pet</h1>
        <p className="text-lg text-gray-600">
          Family management application with Supabase authentication
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/app"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
          >
            Go to App
          </Link>
        </div>
      </div>
    </div>
  );
}
