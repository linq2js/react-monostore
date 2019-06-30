import { arrayEqual } from "monostore";

export default function(states) {
  let statuses = getStatuses(states);

  return {
    hasChange() {
      const nextStatuses = getStatuses(states);
      if (arrayEqual(statuses, nextStatuses)) {
        statuses = nextStatuses;
        return true;
      }
      return false;
    }
  };
}

function getStatuses(states) {
  return states.map(x => [x.done, x.error]).flat();
}
