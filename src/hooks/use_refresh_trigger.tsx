import { create } from "zustand";

/**
 * Interface defining the structure of the refresh store state and actions
 * @interface RefreshStore
 * @property {number} refreshTrigger - A counter that increments to trigger refreshes
 * @property {Function} triggerRefresh - Function to increment the refresh counter
 */
interface RefreshStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

/**
 * Creates a Zustand store for managing refresh state
 * The store contains a counter that can be incremented to trigger UI refreshes
 *
 * @example
 * // Inside the store:
 * const store = useRefreshStore();
 * store.triggerRefresh(); // Increments the counter
 *
 * @returns {RefreshStore} A store containing the refresh state and actions
 */
const useRefreshStore = create<RefreshStore>((set) => ({
  refreshTrigger: 0, // Initial counter value
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

/**
 * Custom hook that provides access to the refresh trigger functionality
 * Used to force re-renders of components by incrementing a counter
 *
 * @example
 * // In a React component:
 * const { refreshTrigger, triggerRefresh } = useRefreshTrigger();
 *
 * // Use refreshTrigger as a dependency in useEffect:
 * useEffect(() => {
 *   // This effect will run whenever refreshTrigger changes
 * }, [refreshTrigger]);
 *
 * // Call triggerRefresh to force a refresh:
 * triggerRefresh();
 *
 * @returns {Object} An object containing:
 * @returns {number} refreshTrigger - The current value of the refresh counter
 * @returns {Function} triggerRefresh - Function to increment the counter and trigger a refresh
 */
export const useRefreshTrigger = () => {
  const { refreshTrigger, triggerRefresh } = useRefreshStore();
  return { refreshTrigger, triggerRefresh };
};
