import { getStateValues } from "monostore/src";
import { useEffect, useRef, useState } from "react";

const useEffectWithDynamicArray = useEffect;

export default function useStates(...states) {
  const [, forceRerender] = useState();
  const unmountRef = useRef(false);
  const valuesRef = useRef();
  const statesRef = useRef();
  const hasMapperRef = useRef(false);
  const statesForCache = states.map(x => (Array.isArray(x) ? x[0] : x));
  if (!valuesRef.current) {
    valuesRef.current = getStateValues(states);
  }
  statesRef.current = states;
  hasMapperRef.current = states.some(x => Array.isArray(x));

  // get unmount status
  useEffect(
    () => () => {
      unmountRef.current = true;
    },
    []
  );

  useEffectWithDynamicArray(
    () => {
      const checkForUpdates = () => {
        // do not rerender if component is unmount
        if (unmountRef.current) {
          return;
        }
        const nextValues = getStateValues(statesRef.current);
        if (!hasMapperRef.current || arrayDiff(valuesRef.current, nextValues)) {
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
