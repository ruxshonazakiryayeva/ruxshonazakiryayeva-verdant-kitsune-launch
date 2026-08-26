import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye } from "lucide-react";
import { callFn } from "@/lib/webinviteApi";

export const Route = createFileRoute("/yaratish")({
  component: YaratishPage,
});

const STORAGE_KEY = "webinvite_login_code";

const TEMPLATES = [
  {
    id: "oisha-birthday",
    name: "Oisha — tug'ilgan kun",
    price: "20 000 so'm",
    emoji: "🎂",
    demoUrl: "https://birthday-oisha-bash.vercel.app/invite/oisha-demo",
    gradient: "from-pink-300 via-rose-300 to-amber-200",
  },
];

function YaratishPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState({ childName: "", age: "", eventDate: "", locationText: "", mapUrl: "" });

  const submit = async () => {
    if (!form.childName || !form.age || !form.eventDate || !form.locationText) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) {
      toast.error("Sessiya topilmadi, kabinetga qaytib qayta kiring");
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

  if (selected) {
    const tpl = TEMPLATES.find((t) => t.id === selected)!;
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <button type="button" onClick={() => setSelected(null)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Katalogga qaytish
        </button>
        <h1 className="text-2xl font-bold text-foreground">{tpl.name} — ma'lumotlar</h1>

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <button type="button" onClick={() => navigate({ to: "/kabinet" })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kabinetga qaytish
      </button>
      <h1 className="text-center text-4xl font-bold text-foreground">Shablonlar katalogi</h1>
      <p className="mt-2 text-center text-muted-foreground">O'zingizga yoqqan shablonni tanlang</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl) => (
          <div key={tpl.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-lg">
            <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${tpl.gradient} text-6xl`}>
              {tpl.emoji}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-foreground">{tpl.name}</h3>
              <p className="mt-1 text-sm font-medium text-amber-600">{tpl.price}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={tpl.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:border-amber-400"
                >
                  <Eye className="h-4 w-4" /> Namuna
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(tpl.id)}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                  Tanlash
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Yana shablonlar tez orada qo'shiladi
        </div>
      </div>
    </div>
  );
}
