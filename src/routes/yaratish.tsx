import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { callFn } from "@/lib/webinviteApi";

export const Route = createFileRoute("/yaratish")({
  component: YaratishPage,
});

const STORAGE_KEY = "webinvite_login_code";

function YaratishPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) {
      toast.error("Avval kabinetga Telegram orqali kiring");
      navigate({ to: "/kabinet" });
      return;
    }
    callFn<{ ok: boolean; editUrl: string }>("create-oisha-invitation", { code })
      .then((res) => {
        // To'g'ridan-to'g'ri haqiqiy Oisha muharririga (rasm, musiqa, dastur bilan) o'tkazamiz
        window.location.href = res.editUrl;
      })
      .catch((e) => {
        console.error(e);
        setError("Xatolik yuz berdi, qayta urinib ko'ring");
      });
  }, [navigate]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/kabinet" })}
          className="mt-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-bold text-white"
        >
          Kabinetga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      <p className="text-muted-foreground">Taklifnoma yaratilmoqda...</p>
    </div>
  );
}
