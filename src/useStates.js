import { getStateValues, arrayEqual } from "monostore";
import createStateStatusMonitor from "./createStateStatusMonitor";
import { useEffect, useRef, useState } from "react";

const useEffectWithDynamicArray = useEffect;

export default function useStates(...states) {
  const [, forceRerender] = useState();
  const unmountRef = useRef(false);
  const valuesRef = useRef();
  const statesRef = useRef();
  const statesForCache = states.map(x => (Array.isArray(x) ? x[0] : x));
  if (!valuesRef.current) {
    valuesRef.current = getStateValues(states);
  }
  statesRef.current = states;

  // get unmount status
  useEffect(
    () => () => {
      unmountRef.current = true;
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
        const nextValues = getStateValues(statesRef.current);
        if (
          arrayEqual(valuesRef.current, nextValues) ||
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

      return () => {
        statesForCache.forEach(state => state.unsubscribe(checkForUpdates));
      };
    },
    // just run this effect once state list changed, has no effect if mapper changed
    statesForCache
  );

  return valuesRef.current;
}
