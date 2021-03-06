# react-monostore

React bindings for monostore

# Features

|                             | monostore | redux |
| --------------------------- | :-------: | :---: |
| Provider element            |           |   ✓   |
| Action Dispatcher           |           |   ✓   |
| Action Creator              |           |   ✓   |
| Reducer                     |           |   ✓   |
| Middleware                  |           |   ✓   |
| connect() HOC               |           |   ✓   |
| Async Action                |     ✓     |       |
| Async State                 |     ✓     |       |
| Computed State              |     ✓     |       |
| Lazy State                  |     ✓     |       |
| State dependency            |     ✓     |       |
| Free Action Dispatching     |     ✓     |       |
| Multiple Stores             |     ✓     |       |
| State Mutation Helpers      |     ✓     |       |
| Action Dispatching Tracking |     ✓     |       |

# Table of contents

1. [Getting started](#getting-started)
1. [Using monostore with React](#using-monostore-with-react)
1. [Playground](https://codesandbox.io/s/react-monostore-8xoxx)
1. [Performance Tests](#performance-tests)

## Getting started

Unlike other state managers, monostore does not store whole app state in a single store,
instead monostore splits your app state into multiple states. You can mutate state via an action.
Take a look at the Counter example below

```jsx harmony
import { createState, createAction } from "monostore";

// create single state with default value 1
const CounterState = createState(1);

// the value prop contains current value of state
console.log(CounterState.value); // 1

// create action to mutate CounterState, the action retrieves state accessor list
// you can add multiple dependency states as you want
// createAction([State1, State2, ...], (stateAccessor1, stateAccessor2, ...) => {})
const Increase = createAction([CounterState], counter =>
  // using counter() to get current value of CounterState
  // using counter(newValue) to update CounterState
  counter(counter() + 1)
);

// just invoke Increase like normal function
Increase();

console.log(CounterState.value); // 2
```

You can pass arguments to action easily like normal function

```jsx harmony
import { createState, createAction } from "monostore";

const CounterState = createState(1);

// extra arguments follow input state accessor list
const Increase = createAction([CounterState], (counter, step = 1) =>
  counter(counter() + step)
);

Increase(2);
console.log(CounterState.value); // 3

Increase();
console.log(CounterState.value); // 4
```

monostore supports async function by default

```jsx harmony
import { createState, createAction } from "monostore";

const CounterState = createState(1);

const Increase = createAction(
  [CounterState],
  counter =>
    new Promise(resolve =>
      setTimeout(() => {
        counter(counter() + 1);
        resolve();
      }, 3000)
    )
);

// a promise returned and we should wait until action executed
Increase(2).then(() => {
  console.log(CounterState.value); // 2
});
```

Remember that an action returns exactly what you returned inside action body,
it can be anything, primitive values, objects, promises

If you feel it difficult to mutate state by using builtin getter and setter,
monostore provided some useful helpers for you

```jsx harmony
import { createState, createAction } from "monostore";

const NumberState = createState(1);
const DateState = createState(new Date("2019-01-01"));
const StringState = createState("Hello {name}");
const BooleanState = createState(true);
const ArrayState = createState([1, 2, 3]);
const ObjectState = createState({ text: "Todo" });

const Update = createAction(
  [NumberState, DateState, StringState, BooleanState, ArrayState, ObjectState],
  (number, date, string, boolean, array, object) => {
    number.add(10); // 11
    number.add(-5); // 6
    number(100); // 100
    date.add(1, "month"); // 2019-02-01
    date.add(29, "day"); // 2019-03-01
    string.replace("{name}", "World"); // Hello World
    boolean.toggle(); // false
    array.push(4, 5, 6); // [1, 2, 3, 4, 5, 6]
    array.shift(); // [2, 3, 4, 5, 6]
    // chaining calls
    array.unshift(-1, 1).pop(); // [-1, 1, 2, 3, 4, 5]
    object.set("done", false); // { text: "Todo", done: false }
    object.prop('newProp').def(100); // { text: "Todo", done: false, newProp: 100 }
  }
);

Update();
```

## Using monostore with React

Let take a look sample of React Todo App

```jsx harmony
import { createState, createAction } from "monostore";
import { useStates } from "react-monostore";
import React from "react";
import { render } from "react-dom";

const NameState = createState("");
const UpdateName = createAction([NameState], (name, value) => name(value));

const App = () => {
  const [name] = useStates(NameState);

  function handleChange(e) {
    UpdateName(e.target.value);
  }

  return (
    <div>
      <input type="text" value={name} onChange={handleChange} />
      <p>Hello {name}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));
```

Using useStates to extract state value from specified state.
You can pass multiple states to useStates then receive array of state value
We can reduce many code lines for above example, a shorter version can be

```jsx harmony
import { createState } from "monostore";
import { useStates } from "react-monostore";
import React from "react";
import { render } from "react-dom";

const NameState = createState("");

const App = () => {
  const [name] = useStates(NameState);

  function handleChange(e) {
    NameState(e.target.value);
  }

  return (
    <div>
      <input type="text" value={name} onChange={handleChange} />
      <p>Hello {name}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));
```

You can update state directly by invoking state as function and passing new value.

Is that pretty short ? Even we can reduce more

```jsx harmony
import { createState } from "monostore";
import { useStates } from "react-monostore";
import React from "react";
import { render } from "react-dom";

const NameState = createState("");

const App = () => {
  const [name] = useStates(NameState);

  return (
    <div>
      <input type="text" value={name} onChange={NameState} />
      <p>Hello {name}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));
```

State is smart enough to process synthetic event without any effort.

## Performance Tests
1. Monostore https://codesandbox.io/s/react-monostore-perf-todo-n5wz7
1. Overmind https://codesandbox.io/s/react-overmind-perf-todo-c53qw
