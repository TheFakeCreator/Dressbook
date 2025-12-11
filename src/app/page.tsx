import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Welcome to Your Clothing Database
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Manage clothing items, create outfits, track character appearances,
            and build your story&apos;s world with precision.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">
              Clothing Items
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">Outfits</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">Characters</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-600">
              Timeline Entries
            </h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Clothing Items */}
          <Link
            href="/items"
            className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Clothing Items
            </h3>
            <p className="text-gray-600">
              Browse, add, and manage your clothing database with historical
              references.
            </p>
          </Link>

          {/* Outfits */}
          <Link
            href="/outfits"
            className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Outfits</h3>
            <p className="text-gray-600">
              Create and manage outfit combinations for your characters.
            </p>
          </Link>

          {/* Characters */}
          <Link
            href="/characters"
            className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Characters
            </h3>
            <p className="text-gray-600">
              Manage your story&apos;s characters and their wardrobe
              preferences.
            </p>
          </Link>

          {/* Timeline */}
          <Link
            href="/timeline"
            className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Timeline</h3>
            <p className="text-gray-600">
              Track what characters wore throughout your story&apos;s timeline.
            </p>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className="group rounded-xl bg-white p-8 shadow-md transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Search</h3>
            <p className="text-gray-600">
              Search across all items, outfits, and historical references.
            </p>
          </Link>

          {/* Settings */}
          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Settings</h3>
            <p className="text-gray-600">
              Configure database, export data, and manage preferences.
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 rounded-xl bg-white p-8 shadow-md">
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            Getting Started
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </span>
              <span>
                <strong>Add Clothing Items:</strong> Start by adding items to
                your database with descriptions, images, and real-world
                historical references.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                2
              </span>
              <span>
                <strong>Create Outfits:</strong> Combine items to create
                complete outfits for different occasions and characters.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                3
              </span>
              <span>
                <strong>Add Characters:</strong> Create character profiles and
                assign them default outfits.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                4
              </span>
              <span>
                <strong>Track Timeline:</strong> Record what characters wore in
                specific scenes and chapters.
              </span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
