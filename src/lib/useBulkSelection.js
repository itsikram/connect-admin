'use client';

import { useCallback, useMemo, useState } from 'react';

// Multi-select state for admin list pages. `visibleIds` are the ids currently shown
// (after search/filter); bulk actions only ever apply to selected ids that are visible.
export default function useBulkSelection(visibleIds) {
  const [selected, setSelected] = useState(() => new Set());

  const selectedIds = useMemo(
    () => visibleIds.filter((id) => selected.has(id)),
    [visibleIds, selected]
  );
  const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length;

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(visibleIds));
  }, [allSelected, visibleIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id) => selected.has(id), [selected]);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Runs a bulk action on the selected ids. `action(ids)` returns a status message.
  // Pass `confirmText` to ask before destructive actions.
  const run = useCallback(async (action, { confirmText, errorText = 'Bulk action failed. Please try again.' } = {}) => {
    const ids = selectedIds;
    if (!ids.length || busy) return;
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      setBusy(true);
      setMessage(null);
      setMessage({ type: 'success', text: await action(ids) });
      setSelected(new Set());
    } catch (err) {
      console.error('Bulk action failed:', err);
      setMessage({ type: 'error', text: err?.response?.data?.message || errorText });
    } finally {
      setBusy(false);
    }
  }, [selectedIds, busy]);

  return { selectedIds, allSelected, toggle, toggleAll, clear, isSelected, busy, message, run };
}
