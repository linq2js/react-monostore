import { deepEqual } from "monostore";
import { createElement, memo, useMemo, useRef } from "react";

/**
 * create memoized component with specified props comparing
 * @param specs
 * @param comp
 * @return {function(*=): React.FunctionComponentElement<object>}
 */
export default function(specs, comp) {
  const memoizedComp = memo(comp);

  return props => {
    const prevPropsRef = useRef(props);
    const versionRef = useRef(0);
    const currentVersion = useMemo(() => {
      if (deepEqual(specs, props, prevPropsRef.current)) {
        versionRef.current++;
      }
    }, [props]);
    return useMemo(() => createElement(memoizedComp, props), [currentVersion]);
  };
}
