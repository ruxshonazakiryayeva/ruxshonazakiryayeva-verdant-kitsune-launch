// Bu qiymatlar sirli emas (anon key), brauzerda ko'rinishi xavfsiz.
const WEBINVITE_FUNCTIONS_URL = "https://hhozdwmlkempoorgknep.supabase.co/functions/v1";
const WEBINVITE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3pkd21sa2VtcG9vcmdrbmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTAyMTgsImV4cCI6MjEwMjEyNjIxOH0._1pRPIAvkliXLbLh6aAlDxntv1A-VDoHAk2ib7lYFl4";

export async function callWebinviteFn<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${WEBINVITE_FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBINVITE_ANON_KEY}`,
      apikey: WEBINVITE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${name} so'rovi muvaffaqiyatsiz`);
  }
  return res.json();
}
