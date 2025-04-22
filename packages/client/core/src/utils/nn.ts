export function nn<T>(value: T | null | undefined, message?: string): T
{
  if (value === null || value === undefined)
  {
    // looks a bit silly, but it'll put null/undefined into the string
    throw new Error(message ?? `Unexpected ${value} value`);
  }

  return value;
}