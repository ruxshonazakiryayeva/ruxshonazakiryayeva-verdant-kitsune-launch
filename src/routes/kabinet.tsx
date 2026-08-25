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
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { callFn } from "@/lib/webinviteApi";

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
  created_at: string;
};

type Profile = { id: string; first_name: string | null; username: string | null };

function invitationTitle(inv: Invitation) {
  if (inv.child_name) return inv.child_name;
  if (inv.groom_name && inv.bride_name) return `${inv.groom_name} & ${inv.bride_name}`;
  return "Taklifnoma";
}

function daysLeft(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
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

function InvitationCard({ inv }: { inv: Invitation }) {
  const left = daysLeft(inv.event_date);
  const link = `${window.location.origin}/i/${inv.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Havola nusxalandi");
  };

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">{invitationTitle(inv)}</h3>
        {inv.status === "active" ? (
          <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-600">
            Faol
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-600">
            Sinov
          </span>
        )}
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

      {inv.status !== "active" && (
        <button
          type="button"
          className="btn-magic mt-3 w-full"
          onClick={() => toast.info("Faollashtirish oqimi tez orada shu yerga ulanadi")}
        >
          Faollashtirish
        </button>
      )}
    </div>
  );
}

function Dashboard({ profile, invitations }: { profile: Profile; invitations: Invitation[] }) {
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
          <InvitationCard key={inv.id} inv={inv} />
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

  const loadDashboard = async (code: string) => {
    setLoading(true);
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

  return <Dashboard profile={profile} invitations={invitations} />;
}
