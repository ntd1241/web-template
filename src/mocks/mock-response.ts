/** Giả lập một response API với độ trễ mạng để giữ trạng thái loading/skeleton thật. */
export function mockResponse<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}
