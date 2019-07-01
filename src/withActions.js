import { createElement, memo, useMemo } from "react";

export default function withActions(actionMap) {
  const entries = Object.entries(actionMap || {});

  return comp => {
    const memoizedComp = memo(comp);

    return props => {
      const newProps = useMemo(() => {
        const result = {};
        entries.forEach(entry => {
          result[entry[0]] =
            entry[1].type === "action"
              ? entry[1]
              : (...args) => entry[1](props, ...args);
        });
      }, [props]);

      return createElement(memoizedComp, {
        ...newProps,
        ...props
      });
    };
  };
}
