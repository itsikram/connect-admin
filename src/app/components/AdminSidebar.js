'use client';

import Link from 'next/link';

export default function AdminSidebar({ navigation = [], admin, sidebarOpen, setSidebarOpen }) {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}> 
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-6 py-8 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {admin?.fullName?.[0] || 'A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


