import { getStateValues, arrayEqual } from "monostore";
import createStateStatusMonitor from "./createStateStatusMonitor";
import { useEffect, useRef, useState } from "react";

const useEffectWithDynamicArray = useEffect;

export default function useStates(...states) {
  const [, forceRerender] = useState();
  const unmountRef = useRef(false);
  const valuesRef = useRef();
  const statesRef = useRef();
  const onUmountRef = useRef();
  const lastErrorRef = useRef();

  if (lastErrorRef.current) {
    const error = lastErrorRef.current;
    lastErrorRef.current = undefined;
    throw error;
  }

  const statesForCache = states.map(x => (Array.isArray(x) ? x[0] : x));
  if (!valuesRef.current) {
    valuesRef.current = getStateValues(states);
  }
  statesRef.current = states;

  // get unmount status
  useEffect(
    () => () => {
      unmountRef.current = true;
      onUmountRef.current && onUmountRef.current();
    },
    []
  );

  useEffectWithDynamicArray(
    () => {
      const asyncStates = statesForCache.filter(x => x.async);
      const asyncStateStatusMonitor = createStateStatusMonitor(asyncStates);
      const checkForUpdates = () => {
        // do not rerender if component is unmount
        if (unmountRef.current) {
          return;
        }
        const nextValues = getStateValues(
          statesRef.current,
          false,
          (error, index) => {
            // if there is any error occurs during selecting value, we keep it then throw it in next render phase
            lastErrorRef.current = error;
            return valuesRef.current ? valuesRef.current[index] : undefined;
          }
        );
        if (
          !arrayEqual(valuesRef.current, nextValues) ||
          asyncStateStatusMonitor.hasChange()
        ) {
          valuesRef.current = nextValues;
          forceRerender({});
        }
      };

      statesForCache.forEach(state => {
        state.subscribe(checkForUpdates);
        state.init();
      });

      // some async action may be done at this time
      checkForUpdates();

      return (onUmountRef.current = () => {
        statesForCache.forEach(state => state.unsubscribe(checkForUpdates));
      });
    },
    // just run this effect once state list changed, has no effect if mapper changed
    statesForCache
  );

  return valuesRef.current;
}
