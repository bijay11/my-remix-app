export function singleton<Value>(name: string, value: () => Value): Value {
  const singletonRegistry = global as any;
  singletonRegistry.__singletons ??= {};
  singletonRegistry.__singletons[name] ??= value();
  return singletonRegistry.__singletons[name];
}
