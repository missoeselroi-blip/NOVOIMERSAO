import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that handles "Failed to fetch dynamically imported module" errors.
 * This usually happens when a new version of the app is deployed and the browser tries to load
 * an old chunk that no longer exists on the server.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        // Log the error and refresh the page once
        console.error('Dynamic import failed, force refreshing page...', error);
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: (() => null) as unknown as T };
      }

      // If we already refreshed and it still fails, throw the error
      throw error;
    }
  });
}
