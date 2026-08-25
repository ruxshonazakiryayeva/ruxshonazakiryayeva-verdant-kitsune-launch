import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Eye,
  Loader2,
  MessageCircle,
  Pencil,
  QrCode,
  Send,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { callFn } from "@/lib/webinviteApi";
import { PAYMENT_CONFIG } from "@/lib/paymentConfig";

export const Route = createFileRoute("/kabinet")({
  component: KabinetPage,
});

const STORAGE_KEY = "webinvite_login_code";

type Invitation = {
  id: string;
  slug: string;
  groom_name: string | null;
  bride_name: string | null;
  child_name: string | null;
  event_date: string | null;
  status: string;
  views_count: number;
  views_limit: number;
  guests_count: number;
  price_to_pay: number;
  final_paid_price: number | null;
  created_at: string;
};

type Profile = { id: string; first_name: string | null; username: string | null; telegram_id?: number };

function invitationTitle(inv: Invitation) {
  if (inv.child_name) return inv.child_name;
  if (inv.groom_name && inv.bride_name) return `${inv.groom_name} & ${inv.bride_name}`;
  return "Taklifnoma";
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
      <h1 className="font-display text-3xl text-foreground">Mening kabinetim</h1>
      <p className="mt-3 text-muted-foreground">
        Kabinetga kirish uchun Telegram botimiz orqali tasdiqlang.
      </p>

      <button
        type="button"
        onClick={startLogin}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Telegram orqali kirish
      </button>

      {deepLink && (
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p>Botda tasdiqlang — sahifa avtomatik ochiladi.</p>
          <a href={deepLink} target="_blank" rel="noopener noreferrer" className="underline">
            Bot ochilmadimi? Shu yerni bosing
          </a>
        </div>
      )}
    </div>
  );
}

function PaymentModal({
  inv,
  profile,
  onClose,
  onSubmitted,
}: {
  inv: Invitation;
  profile: Profile;
  onClose: () => void;
  onSubmitted: () => void;
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-sm rounded-3xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl text-foreground">Faollashtirish</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kartaga to'lovni amalga oshiring va chek rasmini yuklang:
        </p>

        <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Summa</p>
          <p className="font-display text-2xl text-foreground">{amount.toLocaleString("uz-UZ")} so'm</p>

          <button
            type="button"
            onClick={copyCard}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-sm font-medium text-foreground"
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
            className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {profile.username ? (
              <>Telegram: @{profile.username}</>
            ) : (
              <>Telegram username o'rnatilmagan — shuning uchun telefon raqami muhim.</>
            )}
            {" "}Bot xabarini kechroq ko'rsak ham, shu raqam orqali tezroq bog'lanamiz.
          </p>
        </div>

        <label className="btn-magic mt-4 flex w-full cursor-pointer items-center justify-center">
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

function InvitationCard({ inv, onActivateClick }: { inv: Invitation; onActivateClick: () => void }) {
  const left = daysLeft(inv.event_date);
  const link = `${window.location.origin}/i/${inv.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Havola nusxalandi");
  };

  const statusLabel =
    inv.status === "active"
      ? { text: "Faol", cls: "bg-green-500/15 text-green-600" }
      : inv.status === "pending"
        ? { text: "Kutilmoqda", cls: "bg-amber-500/15 text-amber-600" }
        : inv.status === "rejected"
          ? { text: "Rad etilgan", cls: "bg-red-500/15 text-red-600" }
          : { text: "Sinov", cls: "bg-secondary text-muted-foreground" };

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">{invitationTitle(inv)}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusLabel.cls}`}>
          {statusLabel.text}
        </span>
      </div>
      {inv.event_date && (
        <p className="mt-1 text-sm text-muted-foreground">
          Sana: {new Date(inv.event_date).toLocaleDateString("uz-UZ")}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-secondary/60 py-2">
          <p className="text-sm font-bold text-foreground">
            {inv.views_count}/{inv.views_limit}
          </p>
          <p className="text-[11px] text-muted-foreground">Ko'rilgan</p>
        </div>
        <div className="rounded-xl bg-secondary/60 py-2">
          <p className="text-sm font-bold text-foreground">{inv.guests_count}</p>
          <p className="text-[11px] text-muted-foreground">Mehmonlar</p>
        </div>
        <div className="rounded-xl bg-secondary/60 py-2">
          <p className="text-sm font-bold text-foreground">{left !== null ? Math.max(left, 0) : "—"}</p>
          <p className="text-[11px] text-muted-foreground">Kun qoldi</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Tezkor ulashish
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        <button type="button" onClick={copyLink} className="flex flex-col items-center gap-1 rounded-xl bg-secondary/60 py-2 text-[11px]">
          <Copy className="h-4 w-4" /> Nusxa
        </button>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-xl bg-secondary/60 py-2 text-[11px]"
        >
          <Send className="h-4 w-4" /> Telegram
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-xl bg-secondary/60 py-2 text-[11px]"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <button type="button" onClick={copyLink} className="flex flex-col items-center gap-1 rounded-xl bg-secondary/60 py-2 text-[11px]">
          <QrCode className="h-4 w-4" /> QR kod
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={`/i/${inv.slug}`} className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm">
          <Eye className="h-4 w-4" /> Ko'rish
        </a>
        <button type="button" className="flex items-center justify-center gap-1 rounded-xl border border-border py-2 text-sm">
          <Pencil className="h-4 w-4" /> Tahrir
        </button>
      </div>

      {inv.status === "trial" && (
        <button type="button" className="btn-magic mt-3 w-full" onClick={onActivateClick}>
          Faollashtirish
        </button>
      )}
      {inv.status === "pending" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Chekingiz ko'rib chiqilmoqda...
        </p>
      )}
      {inv.status === "rejected" && (
        <button type="button" className="btn-magic mt-3 w-full" onClick={onActivateClick}>
          Qayta yuborish
        </button>
      )}
    </div>
  );
}

function Dashboard({
  profile,
  invitations,
  onActivateClick,
}: {
  profile: Profile;
  invitations: Invitation[];
  onActivateClick: (inv: Invitation) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-center text-4xl text-foreground">
        Mening Taklifnomalarim
      </h1>
      {profile.first_name && (
        <p className="mt-2 text-center text-muted-foreground">Salom, {profile.first_name}!</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => toast.info("Yangi taklifnoma yaratish oqimi tez orada qo'shiladi")}
          className="glass flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border text-muted-foreground"
        >
          <Plus className="h-8 w-8" />
          Yangi yaratish
        </button>

        {invitations.map((inv) => (
          <InvitationCard key={inv.id} inv={inv} onActivateClick={() => onActivateClick(inv)} />
        ))}
      </div>

      {invitations.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Hali taklifnomangiz yo'q — "Yangi yaratish"dan boshlang.
        </p>
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

  // "pending" holatidagi taklifnoma bo'lsa, tasdiqlanishini avtomatik kuzatamiz
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <LoginScreen onConfirmed={(code) => loadDashboard(code)} />;
  }

  return (
    <>
      <Dashboard profile={profile} invitations={invitations} onActivateClick={setActiveModal} />
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
