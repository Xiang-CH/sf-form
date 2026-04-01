/**
 * Node can expose a non-functional `globalThis.localStorage` stub (e.g. when
 * `--localstorage-file` is misconfigured). Next.js and other code that only
 * checks `typeof localStorage !== 'undefined'` then calls `getItem` and throws.
 * Drop the stub so server-side code treats storage as unavailable.
 */
export async function register() {
  const ls = globalThis.localStorage as Storage | undefined;
  if (ls != null && typeof ls.getItem !== 'function') {
    try {
      Reflect.deleteProperty(globalThis, 'localStorage');
    } catch {
      // ignore
    }
  }
}
