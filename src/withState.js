import { createElement } from "react";
import { useStates } from "./index";

export default function withState(state) {
  return comp => props => {
    const [value] = useStates(
      Array.isArray(state)
        ? [state[0], (...args) => state[1](props, ...args)]
        : state
    );
    return createElement(comp, {
      value,
      update: state,
      ...props
    });
  };
}
