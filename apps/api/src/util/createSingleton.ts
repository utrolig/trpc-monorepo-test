type Initializer<T> = () => T;

const container = new WeakMap();

export const createSingleton = <T>(
  init: Initializer<T>
): (() => ReturnType<typeof init>) => {
  return () => {
    if (container.has(init)) {
      return container.get(init);
    }

    const result = init();
    container.set(init, result);
    return result;
  };
};
