import { DependencyList, useCallback, useEffect } from "react";

/**
 * An asynchronous version of useEffect
 *
 * @param effect The callback to be run
 * @param deps
 */
export const useEffectAsync = (effect: () => Promise<any>, deps?: DependencyList): void => {
    // Memoize the effect function using useCallback
    const memoizedEffect = useCallback(effect, deps || []);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                await memoizedEffect();
            } catch (error) {
                if (isMounted) {
                    console.error("Error in useEffectAsync:", error);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [memoizedEffect]);
};
