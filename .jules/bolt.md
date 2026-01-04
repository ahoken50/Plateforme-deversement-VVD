## 2024-05-24 - Memory vs Reality: The Debounce Illusion
**Learning:** Memory or documentation might claim an optimization exists (e.g., "debounced search filtering via useDebounce in Dashboard"), but code analysis may prove otherwise. Always verify implementation details before assuming optimizations are in place.
**Action:** When a performance feature is listed as "implemented", double-check the import and usage in the source code. In this case, `useDebounce` was documented but not used, causing re-filtering on every keystroke.
