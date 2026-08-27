import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { callFn } from "@/lib/webinviteApi";

export const Route = createFileRoute("/yaratish")({
  component: YaratishPage,
});

const STORAGE_KEY = "webinvite_login_code";

function YaratishPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState({ childName: "", age: "", eventDate: "", locationText: "", mapUrl: "" });

  const submit = async () => {
    if (!form.childName || !form.age || !form.eventDate || !form.locationText) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    let code = localStorage.getItem(STORAGE_KEY);
    if (!code) {
      toast.error("Avval kabinetga Telegram orqali kiring");
      navigate({ to: "/kabinet" });
      return;
    }
    setSaving(true);
    try {
      const res = await callFn<{ ok: boolean; url: string }>("create-oisha-invitation", {
        code,
        childName: form.childName,
        age: Number(form.age),
        eventDate: form.eventDate,
        locationText: form.locationText,
        mapUrl: form.mapUrl || undefined,
      });
      setResult(res.url);
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground">🎉 Tayyor!</h1>
        <p className="mt-3 text-muted-foreground">Taklifnomangiz yaratildi:</p>
        <a href={result} target="_blank" rel="noopener noreferrer" className="mt-4 block break-all rounded-2xl bg-secondary/50 p-4 text-amber-600 underline">
          {result}
        </a>
        <button
          type="button"
          onClick={() => navigate({ to: "/kabinet" })}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 font-bold text-white shadow-md hover:opacity-90"
        >
          Kabinetga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <button type="button" onClick={() => navigate({ to: "/#catalog" })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Katalogga qaytish
      </button>
      <h1 className="text-2xl font-bold text-foreground">🎂 Oisha — ma'lumotlar</h1>
      <p className="mt-1 text-sm text-amber-600">20 000 so'm</p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Bola ismi *</label>
          <input className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} placeholder="Oisha" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Yoshi *</label>
          <input type="number" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="4" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Sana va vaqt *</label>
          <input type="datetime-local" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Manzil *</label>
          <input className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500" value={form.locationText} onChange={(e) => setForm({ ...form, locationText: e.target.value })} placeholder="Toshkent, ... to'yxonasi" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Xarita havolasi (ixtiyoriy)</label>
          <input className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500" value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} placeholder="https://maps.google.com/..." />
        </div>
      </div>

      <button type="button" onClick={submit} disabled={saving} className="mt-6 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 font-bold text-white shadow-md hover:opacity-90">
        {saving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Taklifnoma yaratish"}
      </button>
    </div>
  );
}

