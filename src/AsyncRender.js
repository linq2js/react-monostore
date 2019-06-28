import { getStateValues } from "monostore/src";
import { createElement } from "react";
import useStates from "react-monostore/src/useStates";

export function AsyncRender({
  render,
  error,
  children,
  state,
  states,
  prop = "data",
  ...props
}) {
  const results = useStates(...(states || [state]));
  const allDone = results.every(result => result.done);

  if (!allDone) {
    return children;
  }

  const errorObject = state
    ? state.error
    : states.filter(x => x.error).map(x => x.error)[0];

  if (errorObject) {
    if (error) {
      return createElement(error, errorObject);
    }
    return children;
  }

  const data = state ? results[0]() : getStateValues(results, true);

  if (render) {
    return createElement(
      render,
      prop
        ? {
            [prop]: data,
            ...props
          }
        : {
            ...data,
            ...props
          }
    );
  }

  return data;
}
