export function getStateField(state: Record<any, any>, paths: string[]): string | number | object |null {
  let temp: any = state;

  for (let i = 0; i < paths.length; i++) {
    if (!temp) break;
    temp = temp[paths[i]];
  }

  return temp || null;
}

export function setStateField(state: Record<any, any>, paths: string[], value: any) {
  const newState = { [paths[0]]: state[paths[0]] };

  if (paths.length === 1) {
    newState[paths[0]] = value;
    return newState;
  }

  let reference = newState;
  let temp = reference;

  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i];
    if (!temp[path] || typeof temp[path] !== 'object') {
      temp[path] = {};
    }
    temp = temp[path];
  }

  const last = paths[paths.length - 1];
  temp[last] = value;

  return newState;
}