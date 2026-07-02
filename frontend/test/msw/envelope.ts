import { HttpResponse } from "msw";

export function ok<T>(data: T, message = "OK") {
  return HttpResponse.json({ success: true, data, message });
}

export function fail(message: string, status = 502) {
  return HttpResponse.json({ success: false, data: null, message }, { status });
}
