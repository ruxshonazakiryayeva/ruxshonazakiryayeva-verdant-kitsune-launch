import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Eye,
  Loader2,
  LogOut,
  MessageCircle,
  Pencil,
  QrCode,
  Send,
  Trash2,
  Plus,
  Heart,
  Gift,
  MessageSquareHeart,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { callFn } from "@/lib/webinviteApi";
import { PAYMENT_CONFIG } from "@/lib/paymentConfig";

export const Route = createFileRoute("/kabinet")({
  component: KabinetPage,
});

const STORAGE_KEY = "webinvite_login_code";
const OISHA_SITE_URL = "https://birthday-oisha-bash.vercel.app";

type Invitation = {
  id: string;
  slug: string;
  template_id: string;
  groom_name: string | null;
  bride_name: string | null;
  child_name: string | null;
  event_date: string | null;
  status: string;
  views_count: number;
  views_limit: number;
  guests_count: number;
  wishes_count: number;
  price_to_pay: number;
  final_paid_price: number | null;
  created_at: string;
};

type Profile = { id: string; first_name: string | null; username: string | null };

function invitationTitle(inv: Invitation) {
  if (inv.child_name) return inv.child_name;
  if (inv.groom_name && inv.bride_name) return `${inv.groom_name} & ${inv.bride_name}`;
  return "Taklifnoma";
}

function templateIcon(templateId: string) {
  if (templateId === "oisha-birthday") return <Gift className="h-5 w-5" />;
  return <Heart className="h-5 w-5" />;
}

function invitationLink(inv: Invitation) {
  if (inv.template_id === "oisha-birthday") return `${OISHA_SITE_URL}/invite/${inv.slug}`;
  return `${window.location.origin}/i/${inv.slug}`;
}

function editLink(inv: Invitation, code: string) {
  if (inv.template_id === "oisha-birthday") return `${OISHA_SITE_URL}/edit/${inv.slug}?code=${code}`;
  return `${window.location.origin}/edit/${inv.slug}?code=${code}`;
}

function daysLeft(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LoginScreen({ onConfirmed }: { onConfirmed: (code: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLogin = async () => {
    setLoading(true);
    try {
      const { code, deepLink } = await callFn<{ code: string; deepLink: string }>("login-start");
      localStorage.setItem(STORAGE_KEY, code);
      setDeepLink(deepLink);
      window.open(deepLink, "_blank", "noopener,noreferrer");

      pollRef.current = setInterval(async () => {
        const res = await callFn<{ status: string }>("my-invitations", { code });
        if (res.status === "confirmed") {
          if (pollRef.current) clearInterval(pollRef.current);
          onConfirmed(code);
        }
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white">
        <MessageSquareHeart className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-3xl font-bold text-foreground">Mening kabinetim</h1>
      <p className="mt-3 text-muted-foreground">
        Kabinetga kirish uchun Telegram botimiz orqali tasdiqlang.
      </p>

      <button
        type="button"
        onClick={startLogin}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 font-bold text-white shadow-md transition hover:opacity-90"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Telegram orqali kirish
      </button>

      {deepLink && (
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <p>Botda tasdiqlang — sahifa avtomatik ochiladi.</p>
          <a href={deepLink} target="_blank" rel="noopener noreferrer" className="underline">
            Bot ochilmadimi? Shu yerni bosing
          </a>
        </div>
      )}
    </div>
  );
}

function PaymentModal({ inv, profile, onClose, onSubmitted }: { inv: Invitation; profile: Profile; onClose: () => void; onSubmitted: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [phone, setPhone] = useState("");
  const amount = inv.final_paid_price ?? inv.price_to_pay;

  const copyCard = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.cardNumber.replace(/\s/g, ""));
    toast.success("Karta raqami nusxalandi");
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!phone.trim()) {
      toast.error("Avval telefon raqamingizni kiriting");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await callFn("submit-invitation-payment", {
        invitationId: inv.id,
        imageBase64: base64,
        imageType: file.type,
        phone: phone.trim(),
        telegramUsername: profile.username,
      });
      toast.success("Chek yuborildi, tasdiqlanishini kuting");
      onSubmitted();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-foreground">Faollashtirish</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kartaga to'lovni amalga oshiring va chek rasmini yuklang:
        </p>

        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Summa</p>
          <p className="text-2xl font-bold text-amber-700">{amount.toLocaleString("uz-UZ")} so'm</p>

          <button
            type="button"
            onClick={copyCard}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm"
          >
            {PAYMENT_CONFIG.cardNumber}
            <Copy className="h-4 w-4" />
          </button>
          <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_CONFIG.cardOwner}</p>
        </div>

        <div className="mt-4 text-left">
          <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Telefon raqamingiz
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-amber-500"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {profile.username ? <>Telegram: @{profile.username}</> : <>Telegram username o'rnatilmagan.</>}
            {" "}Bot xabarini kechroq ko'rsak ham, shu raqam orqali tezroq bog'lanamiz.
          </p>
        </div>

        <label className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:opacity-90">
          {uploading ? "Yuklanmoqda..." : "Chek rasmini yuklash"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="mt-4 rounded-2xl bg-secondary/40 p-3 text-xs text-muted-foreground">
          Tasdiqlash kechiksa, to'g'ridan-to'g'ri bog'lanishingiz mumkin:
          <div className="mt-1 font-medium text-foreground">{PAYMENT_CONFIG.adminPhone}</div>
          <a href={PAYMENT_CONFIG.adminTelegram} target="_blank" rel="noopener noreferrer" className="underline">
            Telegram orqali yozish
          </a>
        </div>

        <button type="button" onClick={onClose} className="mt-3 text-sm text-muted-foreground underline">
          Yopish
        </button>
      </div>
    </div>
  );
}

function CreateModal({ profile, onClose, onCreated }: { profile: Profile; onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [saving, setSaving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ childName: "", age: "", eventDate: "", locationText: "", mapUrl: "" });

  const submit = async () => {
    if (!form.childName || !form.age || !form.eventDate || !form.locationText) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) {
      toast.error("Sessiya topilmadi, qayta kiring");
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
      setResultUrl(res.url);
      setStep("done");
      onCreated();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {step === "pick" && (
          <>
            <h2 className="text-center text-2xl font-bold text-foreground">Shablon tanlang</h2>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-amber-400"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">🎂</span>
              <span>
                <span className="block font-bold text-foreground">Oisha — tug'ilgan kun</span>
                <span className="block text-xs text-muted-foreground">20 000 so'm</span>
              </span>
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Boshqa shablonlar tez orada qo'shiladi
            </p>
          </>
        )}

        {step === "form" && (
          <>
            <h2 className="text-center text-2xl font-bold text-foreground">Oisha — ma'lumotlar</h2>
            <div className="mt-4 space-y-3 text-left">
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
            <button type="button" onClick={submit} disabled={saving} className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:opacity-90">
              {saving ? "Yaratilmoqda..." : "Taklifnoma yaratish"}
            </button>
            <button type="button" onClick={() => setStep("pick")} className="mt-2 w-full text-center text-sm text-muted-foreground underline">
              Orqaga
            </button>
          </>
        )}

        {step === "done" && resultUrl && (
          <>
            <h2 className="text-center text-2xl font-bold text-foreground">🎉 Tayyor!</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Taklifnomangiz yaratildi:</p>
            <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block break-all rounded-xl bg-secondary/60 p-3 text-center text-sm text-amber-600 underline">
              {resultUrl}
            </a>
            <button type="button" onClick={onClose} className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:opacity-90">
              Kabinetga qaytish
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 py-2 text-center">
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function WishesModal({ inv, code, onClose }: { inv: Invitation; code: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [wishes, setWishes] = useState<any[]>([]);

  useEffect(() => {
    callFn<{ ok: boolean; wishes: any[] }>("list-wishes", { code, invitationId: inv.id })
      .then((res) => setWishes(res.wishes ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [inv.id, code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Tilaklar ({wishes.length})</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />}
          {!loading && wishes.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Hali tilak yo'q</p>
          )}
          {wishes.map((w) => (
            <div key={w.id} className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">{w.guest_name}</p>
                <span className={`text-xs font-bold ${w.attendance === "yes" ? "text-green-600" : "text-red-500"}`}>
                  {w.attendance === "yes" ? "Keladi" : "Kelmaydi"}
                </span>
              </div>
              {w.message && <p className="mt-1 text-sm text-muted-foreground">{w.message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GuestsModal({ inv, code, onClose }: { inv: Invitation; code: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    callFn<{ ok: boolean; guests: any[] }>("manage-guest-links", { action: "list", code, invitationId: inv.id })
      .then((res) => setGuests(res.guests ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(load, [inv.id, code]);

  const addGuest = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await callFn("manage-guest-links", { action: "add", code, invitationId: inv.id, name: name.trim() });
      setName("");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Xatolik yuz berdi");
    } finally {
      setAdding(false);
    }
  };

  const removeGuest = async (id: string) => {
    try {
      await callFn("manage-guest-links", { action: "delete", code, invitationId: inv.id, guestLinkId: id });
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Havola nusxalandi");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Mehmonlar ro'yxati</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGuest()}
            placeholder="Mehmon ismi..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={addGuest}
            disabled={adding}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />}
          {!loading && guests.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Hali mehmon qo'shilmagan</p>
          )}
          {guests.map((g) => (
            <div key={g.id} className="rounded-xl bg-secondary/50 p-3">
              <p className="font-bold text-foreground">{g.name}</p>
              <p className="mt-0.5 truncate text-xs text-amber-600">{g.link}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => copyLink(g.link)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-background"><Copy className="h-3.5 w-3.5" /></button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(g.link)}`} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-background"><Send className="h-3.5 w-3.5" /></a>
                <a href={`https://wa.me/?text=${encodeURIComponent(g.link)}`} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-background"><MessageCircle className="h-3.5 w-3.5" /></a>
                <button type="button" onClick={() => removeGuest(g.id)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Har bir mehmon uchun alohida havola yaratiladi</p>
      </div>
    </div>
  );
}

function InvitationCard({
  inv,
  code,
  onActivateClick,
  onDelete,
}: {
  inv: Invitation;
  code: string;
  onActivateClick: () => void;
  onDelete: () => void;
}) {
  const left = daysLeft(inv.event_date);
  const link = invitationLink(inv);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showWishes, setShowWishes] = useState(false);
  const [showGuests, setShowGuests] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Havola nusxalandi");
  };

  const statusBadge =
    inv.status === "active"
      ? { text: "Faol", cls: "bg-green-100 text-green-700" }
      : inv.status === "pending"
        ? { text: "Kutilmoqda", cls: "bg-amber-100 text-amber-700" }
        : inv.status === "rejected"
          ? { text: "Rad etilgan", cls: "bg-red-100 text-red-700" }
          : { text: "Sinov", cls: "bg-secondary text-muted-foreground" };

  return (
    <div className="relative rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
        onBlur={() => setConfirmDelete(false)}
        className={`absolute right-4 top-4 rounded-full p-1.5 transition ${
          confirmDelete ? "bg-red-500 text-white" : "text-muted-foreground hover:bg-secondary"
        }`}
        title={confirmDelete ? "Tasdiqlash uchun yana bosing" : "O'chirish"}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          {templateIcon(inv.template_id)}
        </span>
        <div>
          <h3 className="text-lg font-bold leading-tight text-foreground">{invitationTitle(inv)}</h3>
          {inv.event_date && (
            <p className="text-xs text-muted-foreground">
              {new Date(inv.event_date).toLocaleDateString("uz-UZ")}
            </p>
          )}
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge.cls}`}>
          {statusBadge.text}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatPill value={`${inv.views_count}/${inv.views_limit}`} label="Ko'rilgan" />
        <StatPill value={inv.guests_count} label="Mehmonlar" />
        <StatPill value={left !== null ? Math.max(left, 0) : "—"} label="Kun qoldi" />
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Tezkor ulashish
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        <button type="button" onClick={copyLink} className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 py-2 text-[11px] text-foreground hover:bg-secondary">
          <Copy className="h-4 w-4" /> Nusxa
        </button>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 py-2 text-[11px] text-foreground hover:bg-secondary">
          <Send className="h-4 w-4" /> Telegram
        </a>
        <a href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 py-2 text-[11px] text-foreground hover:bg-secondary">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <button type="button" onClick={copyLink} className="flex flex-col items-center gap-1 rounded-xl bg-secondary/50 py-2 text-[11px] text-foreground hover:bg-secondary">
          <QrCode className="h-4 w-4" /> QR kod
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setShowWishes(true)} className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:border-amber-400">
          <MessageSquareHeart className="h-4 w-4" /> Tilaklar ({inv.wishes_count ?? 0})
        </button>
        <button type="button" onClick={() => setShowGuests(true)} className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:border-amber-400">
          <UserPlus className="h-4 w-4" /> Mehmonlar
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:border-amber-400">
          <Eye className="h-4 w-4" /> Ko'rish
        </a>
        <a href={editLink(inv, code)} className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:border-amber-400">
          <Pencil className="h-4 w-4" /> Tahrir
        </a>
      </div>

      {showWishes && <WishesModal inv={inv} code={code} onClose={() => setShowWishes(false)} />}
      {showGuests && <GuestsModal inv={inv} code={code} onClose={() => setShowGuests(false)} />}

      {inv.status === "trial" && (
        <button
          type="button"
          className={`mt-3 w-full rounded-full px-4 py-2.5 font-bold text-white shadow-md transition hover:opacity-90 ${
            inv.views_count >= inv.views_limit
              ? "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse"
              : "bg-gradient-to-r from-amber-400 to-yellow-500"
          }`}
          onClick={onActivateClick}
        >
          {inv.views_count >= inv.views_limit ? "⚠️ Bepul ko'rishlar tugadi — Faollashtirish" : "Faollashtirish"}
        </button>
      )}
      {inv.status === "pending" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">Chekingiz ko'rib chiqilmoqda...</p>
      )}
      {inv.status === "rejected" && (
        <button type="button" className="mt-3 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:opacity-90" onClick={onActivateClick}>
          Qayta yuborish
        </button>
      )}
    </div>
  );
}

function AccountTab({ profile, onLogout }: { profile: Profile; onLogout: () => void }) {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-2xl font-bold text-white">
        {(profile.first_name ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <h2 className="mt-4 text-xl font-bold text-foreground">{profile.first_name ?? "Foydalanuvchi"}</h2>
      {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}

      <button
        type="button"
        onClick={onLogout}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Chiqish
      </button>
    </div>
  );
}

function Dashboard({
  profile,
  invitations,
  code,
  onActivateClick,
  onDelete,
  onLogout,
}: {
  profile: Profile;
  invitations: Invitation[];
  code: string;
  onActivateClick: (inv: Invitation) => void;
  onDelete: (inv: Invitation) => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<"invitations" | "account">("invitations");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 font-bold text-white">
            {(profile.first_name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Akkaunt</p>
            <p className="font-bold text-foreground">
              {profile.username ? `@${profile.username}` : profile.first_name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-3.5 w-3.5" /> Chiqish
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("invitations")}
          className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-bold ${
            tab === "invitations" ? "border-amber-500 text-amber-600" : "border-transparent text-muted-foreground"
          }`}
        >
          <Users className="h-4 w-4" /> Taklifnomalar
        </button>
        <button
          type="button"
          onClick={() => setTab("account")}
          className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-bold ${
            tab === "account" ? "border-amber-500 text-amber-600" : "border-transparent text-muted-foreground"
          }`}
        >
          Akkaunt
        </button>
      </div>

      {tab === "account" ? (
        <AccountTab profile={profile} onLogout={onLogout} />
      ) : (
        <>
          <h1 className="mt-10 text-center text-4xl font-bold text-foreground">
            Mening Taklifnomalarim
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <a
              href="/#catalog"
              className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-amber-300 text-amber-600 transition hover:border-amber-500 hover:bg-amber-50"
            >
              <Plus className="h-8 w-8" />
              <span className="font-bold">Yangi yaratish</span>
              <span className="text-xs font-normal text-muted-foreground">Shablonlar katalogiga o'tish</span>
            </a>

            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                inv={inv}
                code={code}
                onActivateClick={() => onActivateClick(inv)}
                onDelete={() => onDelete(inv)}
              />
            ))}
          </div>

          {invitations.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Hali taklifnomangiz yo'q — "Yangi yaratish"dan boshlang.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function KabinetPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeModal, setActiveModal] = useState<Invitation | null>(null);
  const codeRef = useRef<string | null>(null);
  const pendingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDashboard = async (code: string) => {
    codeRef.current = code;
    try {
      const res = await callFn<{ status: string; profile: Profile | null; invitations: Invitation[] }>(
        "my-invitations",
        { code },
      );
      if (res.status === "confirmed") {
        setProfile(res.profile ?? { id: "", first_name: null, username: null });
        setInvitations(res.invitations ?? []);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      loadDashboard(saved);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasPending = invitations.some((i) => i.status === "pending");
    if (hasPending && codeRef.current && !pendingPollRef.current) {
      pendingPollRef.current = setInterval(() => {
        if (codeRef.current) loadDashboard(codeRef.current);
      }, 4000);
    }
    if (!hasPending && pendingPollRef.current) {
      clearInterval(pendingPollRef.current);
      pendingPollRef.current = null;
    }
    return () => {
      if (pendingPollRef.current) {
        clearInterval(pendingPollRef.current);
        pendingPollRef.current = null;
      }
    };
  }, [invitations]);

  const handleDelete = async (inv: Invitation) => {
    const code = codeRef.current;
    if (!code) return;
    try {
      await callFn("delete-invitation", { code, invitationId: inv.id });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      toast.success("O'chirildi");
    } catch (e) {
      console.error(e);
      toast.error("O'chirishda xatolik");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    codeRef.current = null;
    setProfile(null);
    setInvitations([]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!profile) {
    return <LoginScreen onConfirmed={(code) => loadDashboard(code)} />;
  }

  return (
    <>
      <Dashboard
        profile={profile}
        invitations={invitations}
        code={codeRef.current ?? ""}
        onActivateClick={setActiveModal}
        onDelete={handleDelete}
        onLogout={handleLogout}
      />
      {activeModal && (
        <PaymentModal
          inv={activeModal}
          profile={profile}
          onClose={() => setActiveModal(null)}
          onSubmitted={() => {
            setActiveModal(null);
            if (codeRef.current) loadDashboard(codeRef.current);
          }}
        />
      )}
    </>
  );
}
