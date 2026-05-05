export async function* streamSse<T>(
  url: string,
  token: string,
  abortSignal: AbortSignal,
): AsyncGenerator<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: abortSignal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            yield JSON.parse(json) as T;
          } catch { /* ignore malformed frames */ }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
