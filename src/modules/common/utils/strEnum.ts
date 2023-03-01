// https://github.com/basarat/typescript-book/blob/master/docs/types/literal-types.md
/** Utility function to create a K:V from a list of strings */
export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}

// /** Create a K:V */
// const Direction = strEnum(['North', 'South', 'East', 'West']);
// /** Create a Type */
// type Direction = keyof typeof Direction;
