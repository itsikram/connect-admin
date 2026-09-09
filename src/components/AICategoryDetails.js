'use client';

const statusStyles = {
  ready: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

export default function AICategoryDetails({ metadata }) {
  const ai = metadata || {};
  const categories = Array.isArray(ai.categories) ? ai.categories : [];
  const safetyFlags = Array.isArray(ai.contentSafetyFlags) ? ai.contentSafetyFlags : [];
  const status = ai.status || 'pending';

  return (
    <section className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">AI categorization</h4>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
          {status}
        </span>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Generated categories</p>
        {categories.length ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white">
                {category}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No categories generated yet.</p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 dark:text-gray-300">
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Sentiment</dt>
          <dd>{ai.sentiment || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Provider</dt>
          <dd>{ai.provider || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Embedding</dt>
          <dd>{Array.isArray(ai.embedding) ? `${ai.embedding.length} dimensions` : 'Unavailable'}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">Embedding model</dt>
          <dd className="truncate" title={ai.embeddingModel || ''}>{ai.embeddingModel || '—'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium text-gray-500 dark:text-gray-400">Processed</dt>
          <dd>{ai.processedAt ? new Date(ai.processedAt).toLocaleString() : 'Not processed'}</dd>
        </div>
        {ai.contentHash && (
          <div className="col-span-2">
            <dt className="font-medium text-gray-500 dark:text-gray-400">Content hash</dt>
            <dd className="truncate font-mono" title={ai.contentHash}>{ai.contentHash}</dd>
          </div>
        )}
      </dl>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Safety flags</p>
        {safetyFlags.length ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {safetyFlags.map((flag) => (
              <span key={flag} className="rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-200">
                {flag}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">None detected</p>
        )}
      </div>

      {ai.error && <p className="mt-3 text-xs text-red-700 dark:text-red-300">Error: {ai.error}</p>}
    </section>
  );
}
