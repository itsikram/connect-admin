'use client';

// Toolbar shown above admin lists: select-all checkbox, selection count and bulk action buttons.
export default function BulkActionBar({ selection, total, children }) {
  const { busy, message } = selection;
  if (!total && !message) return null;
  const count = selection.selectedIds.length;

  return (
    <div className="mb-4 space-y-2">
      {message && (
        <div className={`rounded-lg border px-4 py-2 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200' : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200'}`}>
          {message.text}
        </div>
      )}
      {total > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={selection.allSelected}
              onChange={selection.toggleAll}
              disabled={busy}
            />
            Select all ({total})
          </label>
          {count > 0 && (
            <>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{count} selected</span>
              <fieldset disabled={busy} className="flex flex-wrap items-center gap-2">{children}</fieldset>
              <button
                type="button"
                onClick={selection.clear}
                disabled={busy}
                className="ml-auto text-sm text-gray-500 dark:text-gray-400 hover:underline disabled:opacity-50"
              >
                Clear
              </button>
            </>
          )}
          {busy && <span className="text-sm text-gray-500 dark:text-gray-400">Working…</span>}
        </div>
      )}
    </div>
  );
}

// Checkbox for one row/card.
export function BulkCheckbox({ selection, id, className = '' }) {
  return (
    <input
      type="checkbox"
      aria-label="Select item"
      className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer ${className}`}
      checked={selection.isSelected(id)}
      onChange={() => selection.toggle(id)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// Shared button styles for bulk actions.
export const bulkButtonClass = {
  primary: 'px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50',
  neutral: 'px-3 py-1.5 rounded-md bg-gray-600 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-50',
  success: 'px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50',
  danger: 'px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50',
};

// "Set audience" dropdown for posts and watches (1 = public, 2 = friends, 3 = only me).
export function AudienceSelect({ onSelect }) {
  return (
    <select
      value=""
      onChange={(e) => e.target.value && onSelect(Number(e.target.value))}
      className="px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
    >
      <option value="">Set audience…</option>
      <option value="1">Public</option>
      <option value="2">Friends</option>
      <option value="3">Only me</option>
    </select>
  );
}

// Message for a bulk delete response ({ succeeded, failed }).
export function bulkDeleteMessage(data, noun) {
  const done = data?.succeeded?.length || 0;
  const failed = data?.failed?.length || 0;
  return `Deleted ${done} ${noun}${done === 1 ? '' : 's'}.` + (failed ? ` ${failed} could not be deleted.` : '');
}
