import { createElement, memo } from "react";
import useStates from "./useStates";

/**
 *
 * @param stateMap
 * @param fallbackOrOptions
 * @return {function(*=): Function}
 */

export default function withStates(stateMap, fallbackOrOptions) {
  if (
    typeof fallbackOrOptions === "function" ||
    typeof fallbackOrOptions === "boolean" ||
    // support styled component
    (fallbackOrOptions && fallbackOrOptions.styledComponentId)
  ) {
    fallbackOrOptions = { fallback: fallbackOrOptions };
  }

  const { fallback, useUpdaters = false } = fallbackOrOptions;

  const entries = Object.entries(stateMap || {});
  const states = entries.map(x => x[1]);

  if (states.some(state => !state.async)) {
    throw new Error("Expect async state but got sync state");
  }

  return comp => {
    const memoizedComp = memo(comp);
    return props => {
      const results = useStates(...states);
      const newProps = {};

      let allDone = true;

      results.forEach((result, index) => {
        const prop = entries[index][0];
        newProps[prop] = states[index];
        if (!result.done || result.error) {
          allDone = false;
        } else {
          newProps[prop + "Done"] = true;
        }
      });

      if (!allDone && fallback !== false) {
        return fallback ? createElement(fallback, props) : null;
      }

      if (useUpdaters) {
        // generate updaters
        entries.forEach(
          entry =>
            (newProps[
              "update" + entry[0].charAt(0).toUpperCase() + entry[0].substr(1)
            ] = entry[1])
        );
      }

      Object.assign(newProps, props);

      return createElement(memoizedComp, newProps);
    };
  };
}
