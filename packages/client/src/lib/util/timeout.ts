export function createTimeout(timeout: number): AbortSignal 
{
  const controller = new AbortController();

  setTimeout(() => controller.abort('Timeout'), timeout);

  return controller.signal;
}