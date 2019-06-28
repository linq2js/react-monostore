import { createElement, memo } from "react";

export default function hoc(...callbacks) {
  return callbacks.reduce(
    (nextHoc, callback) => Component => {
      const MemoComponent = memo(Component);

      return props => {
        // callback requires props and Comp, it must return React element
        if (callback.length > 1) {
          return callback(props, MemoComponent);
        }
        let newProps = callback(props);
        if (newProps === false) return null;
        if (!newProps) {
          newProps = props;
        }

        return createElement(MemoComponent, newProps);
      };
    },
    Component => Component
  );
}
