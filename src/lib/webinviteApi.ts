// Bu qiymatlar sirli emas (anon/publishable key), brauzerda ko'rinishi xavfsiz.
export const WEBINVITE_API = {
  functionsUrl: "https://hhozdwmlkempoorgknep.supabase.co/functions/v1",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3pkd21sa2VtcG9vcmdrbmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTAyMTgsImV4cCI6MjEwMjEyNjIxOH0._1pRPIAvkliXLbLh6aAlDxntv1A-VDoHAk2ib7lYFl4",
};

export async function callFn<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${WEBINVITE_API.functionsUrl}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBINVITE_API.anonKey}`,
      apikey: WEBINVITE_API.anonKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} so'rovi muvaffaqiyatsiz: ${res.status}`);
  return res.json();
}
