import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/")({
  component: WebInvitePage,
});

type Lang = "uz" | "ru" | "en";
type Theme = "light" | "dark";

const translations: Record<Lang, Record<string, string>> = {
  uz: {
    "nav.catalog": "Katalog",
    "nav.how": "Qanday ishlaydi",
    "nav.pricing": "Narxlar",
    "nav.faq": "Savollar",
    "nav.contact": "Aloqa",
    "nav.cta": "Buyurtma berish",
    "hero.eyebrow": "Raqamli taklifnomalar",
    "hero.title": "Har bir <em>tantana</em> o'z hikoyasiga loyiq",
    "hero.lede":
      "To'y, tug'ilgan kun va yubileyingiz uchun noyob dizaynli raqamli taklifnoma yarataylik — mehmonlaringiz bir bosishda ochadi.",
    "hero.cta1": "Dizaynlarni ko'rish",
    "hero.cta2": "Bepul konsultatsiya",
    "hero.stat1": "Yaratilgan taklifnoma",
    "hero.stat2": "Tayyor bo'lish vaqti",
    "hero.stat3": "Qo'llab-quvvatlash",
    "hero.env.eyebrow": "Aziz mehmon",
    "hero.env.text":
      "Sizni to'yimizga taklif qilamiz · 12-sentabr, 2026 · Samarqand",
    "hero.env.hint": "↑ ochish uchun bosing",
    "cat.eyebrow": "Katalog",
    "cat.title": "Har bir tadbir uchun dizayn",
    "cat.item1": "\"O'tkan kunlar\" ruhida — Otabek va Kumush uslubi, atlas naqshlar va milliy bezaklar, oltin harflar, sanoq taymeri, xarita va musiqa bilan.",
    "cat.item2": "Quyosh botishi fonida shaxsiy fotolar, iliq oltin rang va musiqa bilan.",
    "cat.item3": "Qora-oltin minimalist uslub, sanoq taymeri va nafis animatsiyalar bilan.",
    "cat.item4": "Qizlar bazmi uchun nozik gullar, pushti tuslar va sekin animatsiyalar bilan.",
    "cat.item5":
      "Ko'p tilli, musiqali va ijtimoiy tarmoqlarda ulashish imkoniyatiga ega taklifnoma.",
    "cat.item6": "Nafis va zamonaviy uslub, ko'p tilli sanoq taymeri va musiqa bilan.",
    "cat.item7": "Yorqin ranglar, foto-galereya va sokin animatsiyalar bilan bezatilgan taklifnoma.",
    "cat.more": "Barcha dizaynlarni so'rash",
    "filter.all": "Barchasi",
    "filter.wedding": "To'y",
    "filter.party": "Bazm",
    "filter.other": "Boshqa",
    "dev.eyebrow": "Moslashuvchan dizayn",
    "dev.title": "Kompyuter, planshet va telefonda — bir xil chiroyli",
    "dev.caption":
      "Har bir taklifnoma barcha ekran o'lchamlarida to'liq moslashadi — mehmonlaringiz qaysi qurilmadan ochmasin, tajriba bir xil chiroyli bo'ladi.",
    "how.eyebrow": "Jarayon",
    "how.title": "Uch qadamda tayyor",
    "how.s1.title": "Dizaynni tanlang",
    "how.s1.text":
      "Katalogdan tadbiringizga mos uslubni tanlang yoki individual dizayn buyurtma qiling.",
    "how.s2.title": "Ma'lumot bering",
    "how.s2.text": "Ism, sana, manzil va matnni yuboring — qolganini biz bezaymiz.",
    "how.s3.title": "Ulashing",
    "how.s3.text":
      "Havola yoki QR-kod orqali mehmonlaringizga bir necha soniyada yuboring.",
    "price.eyebrow": "Narx",
    "price.title": "Shaffof va sodda narx",
    "price.standard.badge": "Standart",
    "price.standard.title": "Katalogdagi shablon asosida",
    "price.standard.note": "+ 1 bepul Instagram-hikoya bonus sifatida",
    "price.standard.li1": "Katalogdagi tayyor dizaynlardan biri",
    "price.standard.li2": "4 tilda matn (o'zbek, rus, ingliz, qoraqalpoq)",
    "price.standard.li3": "Xarita, sanoq va mehmonlar ro'yxati",
    "price.standard.li4": "24 soat ichida tayyor",
    "price.premium.badge": "Premium · Individual",
    "price.premium.title": "Sizga xos, noyob dizayn",
    "price.premium.note": "Shablonlar yoqmasami? O'zingiz xohlagan uslubda, noldan yasab beramiz.",
    "price.premium.li1": "100% individual, takrorlanmas dizayn",
    "price.premium.li2": "Sizning g'oyangiz va uslubingiz asosida",
    "price.premium.li3": "Xarita, sanoq, musiqa va mehmonlar ro'yxati",
    "price.premium.li4": "Narx loyiha murakkabligiga qarab belgilanadi",
    "price.cta": "Buyurtma berish",
    "price.cta.consult": "Bepul konsultatsiya",
    "faq.eyebrow": "Savollar",
    "faq.title": "Ko'p so'raladigan savollar",
    "faq.q1": "Taklifnoma qancha vaqtda tayyor bo'ladi?",
    "faq.a1":
      "Odatda 24 soat ichida. Murakkab individual dizaynlar uchun 2-3 kun ketishi mumkin.",
    "faq.q2": "Qanday tillarni qo'llab-quvvatlaysiz?",
    "faq.a2":
      "O'zbek (lotin va kirill), rus va ingliz tillari. Kerak bo'lsa qo'shimcha tillar ham qo'shiladi.",
    "faq.q3": "Taklifnomani qanday ulashaman?",
    "faq.a3":
      "Sizga shaxsiy havola va QR-kod beriladi — ularni Instagram, Telegram yoki bosma taklifnomada ishlatishingiz mumkin.",
    "faq.q4": "To'lov qanday amalga oshiriladi?",
    "faq.a4":
      "Dizayn tasdiqlangandan so'ng Click, Payme yoki naqd pul orqali to'lashingiz mumkin.",
    "contact.eyebrow": "Aloqa",
    "contact.title": "Buyurtma berishga tayyormisiz?",
    "contact.lede":
      "Formani to'ldiring — 1 soat ichida siz bilan bog'lanamiz. Yoki quyidagi kanallar orqali to'g'ridan-to'g'ri yozing.",
    "form.name": "Ismingiz",
    "form.phone": "Telefon raqam",
    "form.event": "Tadbir turi",
    "form.event1": "To'y",
    "form.event2": "Tug'ilgan kun",
    "form.event3": "Yubiley",
    "form.event4": "Boshqa",
    "form.msg": "Qo'shimcha ma'lumot",
    "form.submit": "Ariza yuborish",
    "form.sending": "Yuborilmoqda...",
    "form.ok": "Rahmat! Arizangiz qabul qilindi, tez orada bog'lanamiz.",
    "foot.desc":
      "Raqamli taklifnomalarni his-tuyg'u va uslub bilan yaratamiz — sizning muhim onlaringiz uchun.",
    "foot.follow": "Bizni quyidagi ijtimoiy tarmoqlardan kuzatib boring:",
    "foot.links": "Havolalar",
    "foot.contact": "Aloqa",
    "foot.city": "Sirdaryo, O'zbekiston",
    "foot.rights": "Barcha huquqlar himoyalangan.",
    "foot.made": "Sevgi bilan yaratilgan",
  },
  ru: {
    "nav.catalog": "Каталог",
    "nav.how": "Как это работает",
    "nav.pricing": "Цены",
    "nav.faq": "Вопросы",
    "nav.contact": "Контакты",
    "nav.cta": "Заказать",
    "hero.eyebrow": "Цифровые приглашения",
    "hero.title": "Каждое <em>торжество</em> достойно своей истории",
    "hero.lede":
      "Создадим для вашей свадьбы, дня рождения или юбилея уникальное цифровое приглашение — гости откроют его одним нажатием.",
    "hero.cta1": "Смотреть дизайны",
    "hero.cta2": "Бесплатная консультация",
    "hero.stat1": "Созданных приглашений",
    "hero.stat2": "Время готовности",
    "hero.stat3": "Языка поддержки",
    "hero.env.eyebrow": "Дорогой гость",
    "hero.env.text":
      "Приглашаем вас на свадьбу · 12 сентября 2026 · Самарканд",
    "hero.env.hint": "↑ нажмите, чтобы открыть",
    "cat.eyebrow": "Каталог",
    "cat.title": "Дизайн для каждого события",
    "cat.item1": "В духе \"Минувших дней\" — стиль Отабека и Кумуш, атласные узоры и национальный орнамент, золотой шрифт, таймер, карта и музыка.",
    "cat.item2": "Личные фото на фоне заката, тёплые золотые тона и музыка.",
    "cat.item3": "Чёрно-золотой минималистичный стиль, таймер и изящная анимация.",
    "cat.item4": "Для девичника — нежные цветы, розовые тона и плавная анимация.",
    "cat.item5":
      "Многоязычное приглашение с музыкой и возможностью поделиться в соцсетях.",
    "cat.item6": "Изысканный современный стиль, многоязычный таймер и музыка.",
    "cat.item7": "Яркие цвета, фотогалерея и плавные анимации.",
    "cat.more": "Запросить все дизайны",
    "filter.all": "Все",
    "filter.wedding": "Свадьба",
    "filter.party": "Вечеринка",
    "filter.other": "Другое",
    "dev.eyebrow": "Адаптивный дизайн",
    "dev.title": "Компьютер, планшет и телефон — одинаково красиво",
    "dev.caption":
      "Каждое приглашение полностью адаптируется под любой экран — независимо от устройства гостя впечатление остаётся одинаково красивым.",
    "how.eyebrow": "Процесс",
    "how.title": "Готово за три шага",
    "how.s1.title": "Выберите дизайн",
    "how.s1.text":
      "Выберите подходящий стиль из каталога или закажите индивидуальный дизайн.",
    "how.s2.title": "Отправьте данные",
    "how.s2.text": "Имя, дата, адрес и текст — остальное оформим мы.",
    "how.s3.title": "Поделитесь",
    "how.s3.text": "Отправьте гостям ссылку или QR-код за секунды.",
    "price.eyebrow": "Цена",
    "price.title": "Прозрачная и простая цена",
    "price.standard.badge": "Стандарт",
    "price.standard.title": "На основе шаблона из каталога",
    "price.standard.note": "+ 1 бесплатная Instagram-история в подарок",
    "price.standard.li1": "Один из готовых дизайнов каталога",
    "price.standard.li2": "Текст на 4 языках",
    "price.standard.li3": "Карта, таймер и список гостей",
    "price.standard.li4": "Готово за 24 часа",
    "price.premium.badge": "Премиум · Индивидуально",
    "price.premium.title": "Уникальный дизайн специально для вас",
    "price.premium.note": "Не нравятся шаблоны? Создадим дизайн с нуля в вашем стиле.",
    "price.premium.li1": "100% индивидуальный, неповторимый дизайн",
    "price.premium.li2": "На основе вашей идеи и стиля",
    "price.premium.li3": "Карта, таймер, музыка и список гостей",
    "price.premium.li4": "Цена зависит от сложности проекта",
    "price.cta": "Заказать",
    "price.cta.consult": "Бесплатная консультация",
    "faq.eyebrow": "Вопросы",
    "faq.title": "Часто задаваемые вопросы",
    "faq.q1": "Сколько времени занимает изготовление?",
    "faq.a1":
      "Обычно 24 часа. Для сложных индивидуальных дизайнов — 2-3 дня.",
    "faq.q2": "Какие языки вы поддерживаете?",
    "faq.a2":
      "Узбекский (латиница и кириллица), русский и английский. При необходимости добавим и другие.",
    "faq.q3": "Как поделиться приглашением?",
    "faq.a3":
      "Вы получите личную ссылку и QR-код — используйте их в Instagram, Telegram или на печатном приглашении.",
    "faq.q4": "Как происходит оплата?",
    "faq.a4":
      "После утверждения дизайна можно оплатить через Click, Payme или наличными.",
    "contact.eyebrow": "Контакты",
    "contact.title": "Готовы сделать заказ?",
    "contact.lede":
      "Заполните форму — свяжемся в течение часа. Или напишите напрямую по каналам ниже.",
    "form.name": "Ваше имя",
    "form.phone": "Номер телефона",
    "form.event": "Тип события",
    "form.event1": "Свадьба",
    "form.event2": "День рождения",
    "form.event3": "Юбилей",
    "form.event4": "Другое",
    "form.msg": "Дополнительная информация",
    "form.submit": "Отправить заявку",
    "form.sending": "Отправка...",
    "form.ok": "Спасибо! Ваша заявка принята, скоро свяжемся.",
    "foot.desc":
      "Создаём цифровые приглашения с душой и стилем — для ваших важных моментов.",
    "foot.follow": "Подписывайтесь на нас в соцсетях:",
    "foot.links": "Ссылки",
    "foot.contact": "Контакты",
    "foot.city": "Сырдарья, Узбекистан",
    "foot.rights": "Все права защищены.",
    "foot.made": "Сделано с любовью",
  },
  en: {
    "nav.catalog": "Catalog",
    "nav.how": "How it works",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.cta": "Order now",
    "hero.eyebrow": "Digital invitations",
    "hero.title": "Every <em>celebration</em> deserves its own story",
    "hero.lede":
      "Let's create a uniquely designed digital invitation for your wedding, birthday, or anniversary — your guests open it in a single tap.",
    "hero.cta1": "View designs",
    "hero.cta2": "Free consultation",
    "hero.stat1": "Invitations created",
    "hero.stat2": "Turnaround time",
    "hero.stat3": "Languages supported",
    "hero.env.eyebrow": "Dear guest",
    "hero.env.text":
      "You're invited to our wedding · September 12, 2026 · Samarkand",
    "hero.env.hint": "↑ tap to open",
    "cat.eyebrow": "Catalog",
    "cat.title": "A design for every occasion",
    "cat.item1": "In the spirit of \"Days Gone By\" — Otabek & Kumush style, atlas-silk patterns and national ornaments, gold type, countdown, map and music.",
    "cat.item2": "Personal photos on a sunset backdrop, warm gold tones and music.",
    "cat.item3": "Black-and-gold minimalist style with countdown and elegant animations.",
    "cat.item4": "For a bachelorette party, with soft florals, pink tones and smooth motion.",
    "cat.item5": "Multilingual invitation with music and social sharing.",
    "cat.item6": "An elegant modern style with a multilingual countdown and music.",
    "cat.item7": "Bright colors, a photo gallery and smooth, gentle animations.",
    "cat.more": "Request all designs",
    "filter.all": "All",
    "filter.wedding": "Wedding",
    "filter.party": "Party",
    "filter.other": "Other",
    "dev.eyebrow": "Responsive design",
    "dev.title": "Desktop, tablet, and phone — equally beautiful",
    "dev.caption":
      "Every invitation fully adapts to any screen — whichever device your guests open it on, the experience stays just as beautiful.",
    "how.eyebrow": "Process",
    "how.title": "Ready in three steps",
    "how.s1.title": "Choose a design",
    "how.s1.text":
      "Pick a style from the catalog or request a fully custom design.",
    "how.s2.title": "Send the details",
    "how.s2.text": "Names, date, venue and text — we handle the rest.",
    "how.s3.title": "Share it",
    "how.s3.text": "Send guests a link or QR code in seconds.",
    "price.eyebrow": "Pricing",
    "price.title": "Simple, transparent pricing",
    "price.standard.badge": "Standard",
    "price.standard.title": "Based on a catalog template",
    "price.standard.note": "+ 1 free Instagram story included",
    "price.standard.li1": "One of the ready-made catalog designs",
    "price.standard.li2": "Text in 4 languages",
    "price.standard.li3": "Map, countdown and guest list",
    "price.standard.li4": "Ready within 24 hours",
    "price.premium.badge": "Premium · Custom",
    "price.premium.title": "A one-of-a-kind design, made for you",
    "price.premium.note": "Don't love the templates? We'll design something entirely your own, from scratch.",
    "price.premium.li1": "100% custom, one-of-a-kind design",
    "price.premium.li2": "Built around your own idea and style",
    "price.premium.li3": "Map, countdown, music and guest list",
    "price.premium.li4": "Price depends on project complexity",
    "price.cta": "Order now",
    "price.cta.consult": "Free consultation",
    "faq.eyebrow": "FAQ",
    "faq.title": "Frequently asked questions",
    "faq.q1": "How long does an invitation take?",
    "faq.a1":
      "Usually 24 hours. Complex custom designs may take 2-3 days.",
    "faq.q2": "Which languages do you support?",
    "faq.a2":
      "Uzbek (Latin and Cyrillic), Russian and English. Additional languages can be added on request.",
    "faq.q3": "How do I share the invitation?",
    "faq.a3":
      "You'll get a personal link and QR code — use them on Instagram, Telegram, or a printed invitation.",
    "faq.q4": "How does payment work?",
    "faq.a4":
      "Once the design is approved, you can pay via Click, Payme, or cash.",
    "contact.eyebrow": "Contact",
    "contact.title": "Ready to place an order?",
    "contact.lede":
      "Fill out the form — we'll reach out within an hour. Or message us directly through the channels below.",
    "form.name": "Your name",
    "form.phone": "Phone number",
    "form.event": "Event type",
    "form.event1": "Wedding",
    "form.event2": "Birthday",
    "form.event3": "Anniversary",
    "form.event4": "Other",
    "form.msg": "Additional details",
    "form.submit": "Send request",
    "form.sending": "Sending...",
    "form.ok": "Thank you! Your request has been received, we'll be in touch soon.",
    "foot.desc":
      "We craft digital invitations with feeling and style — for your most important moments.",
    "foot.follow": "Follow us on social media:",
    "foot.links": "Links",
    "foot.contact": "Contact",
    "foot.city": "Sirdaryo, Uzbekistan",
    "foot.rights": "All rights reserved.",
    "foot.made": "Made with love",
  },
};

const ADMIN_PASSWORD = "webinvite2026";

type Submission = {
  created_at: string;
  name: string;
  phone: string;
  event: string;
  message: string;
};

type CatItem = {
  cat: "wedding" | "party" | "birthday" | "other";
  tagKey: string;
  title: string;
  descKey: string;
  href: string;
  img: string;
  editHref?: string;
};

const CATALOG: CatItem[] = [
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "O'tkan kunlar",
    descKey: "cat.item1",
    href: "https://wedding-otabekandkumush.vercel.app/",
    img: "https://api.microlink.io/?url=https://wedding-otabekandkumush.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "Golden Vows",
    descKey: "cat.item2",
    href: "https://wedding-invitation-1-jasur-nilufar.vercel.app/",
    img: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8d8f0a38-d2b5-4e0d-8af2-06948233b80f",
  },
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "Wedding Studio",
    descKey: "cat.item3",
    href: "https://wedding-invitation-2-sherzod-kumush.vercel.app/",
    img: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9c7df204-2d60-4555-abea-a245e4eb0c28",
  },
  {
    cat: "party",
    tagKey: "filter.party",
    title: "Qizlar bazmi Durdona",
    descKey: "cat.item4",
    href: "https://bacheloretteparty-durdona.vercel.app/",
    img: "https://api.microlink.io/?url=https://bacheloretteparty-durdona.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
  },
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "Islom & Sevinch",
    descKey: "cat.item5",
    href: "https://wedding-invitation-3-islom-sevinch.vercel.app/",
    img: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e62f57dd-02c6-49f9-bcba-0b4b7a3a188a/id-preview-7697f9ac--fed3aca6-c3f3-44fd-b94e-02603c8218d6.lovable.app-1783065695862.png",
  },
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "Kamol & Sabina",
    descKey: "cat.item6",
    href: "https://wedding-ivitation-6-kamol-sabina.vercel.app/",
    img: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c29b4278-22aa-4f5e-821f-3f77eec6ebc5/id-preview-6221937e--8ee7e74f-5bd6-41fb-b6f7-cb1f4227fac9.lovable.app-1783482725163.png",
  },
  {
    cat: "wedding",
    tagKey: "filter.wedding",
    title: "Firdavs & Yasmina",
    descKey: "cat.item7",
    href: "https://wedding-invitation-5-firdavs-yasmina.vercel.app/",
    img: "https://api.microlink.io/?url=https://firdavs-yasmina.lovable.app&screenshot=true&meta=false&embed=screenshot.url",
  },
   {
    cat: "other",
    tagKey: "filter.other",
    title: "Oisha",
    descKey: "cat.item7",
    href: "https://birthday-oisha-bash.vercel.app/",
    img: "https://api.microlink.io/?url=https://birthday-oisha-bash.vercel.app/&screenshot=true&meta=false&embed=screenshot.url",
  },
];

function renderHtml(html: string) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function WebInvitePage() {
  const [lang, setLang] = useState<Lang>("uz");
  const [theme, setTheme] = useState<Theme>("light");
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "wedding" | "party" | "other">(
    "all",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [audioOn, setAudioOn] = useState(false);
  const [audioMissing, setAudioMissing] = useState(false);
  const [adminOverlay, setAdminOverlay] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [adminDash, setAdminDash] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [visitsToday, setVisitsToday] = useState(0);
  const [visitsTotal, setVisitsTotal] = useState(0);
  const [formStatus, setFormStatus] = useState<string>("");
  const [formSending, setFormSending] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const t = (k: string): string =>
    translations[lang][k] ?? translations.uz[k] ?? k;

  // Apply theme + lang to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Visit counter (Supabase — shared across all devices)
  useEffect(() => {
    if (sessionStorage.getItem("wi_counted")) return;
    sessionStorage.setItem("wi_counted", "1");
    supabase
      .from("site_visits")
      .insert({})
      .then(({ error }) => {
        if (error) console.error("[visits] insert error", error);
      });
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: total }, { count: day }] = await Promise.all([
      supabase.from("site_visits").select("*", { count: "exact", head: true }),
      supabase
        .from("site_visits")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00Z`),
    ]);
    setVisitsTotal(total || 0);
    setVisitsToday(day || 0);
  };

  // Scroll reveal
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal:not(.in)");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter]);

  // Petals
  const petals = useMemo(() => {
    const colors = ["var(--gold)", "var(--wax)", "var(--gold-deep)"];
    return Array.from({ length: 14 }).map((_, i) => {
      const size = 8 + Math.random() * 8;
      return {
        left: Math.random() * 100,
        dur: 10 + Math.random() * 10,
        delay: Math.random() * 12,
        size,
        color: colors[i % 3],
      };
    });
  }, []);

  const toggleAudio = () => {
    if (audioMissing) return;
    const a = audioRef.current;
    if (!a) return;
    if (audioOn) {
      a.pause();
      setAudioOn(false);
    } else {
      a.play().then(() => setAudioOn(true)).catch(() => {});
    }
  };

  const loadSubs = async () => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[submissions] load error", error);
      setSubs([]);
      return;
    }
    setSubs((data as Submission[]) || []);
  };

  const submitOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if ((fd.get("bot-field") as string)?.length) return;
    setFormSending(true);
    setFormStatus(t("form.sending"));
    const sub = {
      name: (fd.get("name") as string) || "",
      phone: (fd.get("phone") as string) || "",
      event: (fd.get("event") as string) || "",
      message: (fd.get("message") as string) || "",
    };
    const { error } = await supabase.from("submissions").insert(sub);
    if (error) console.error("[submissions] insert error", error);
    setFormStatus(t("form.ok"));
    setFormSending(false);
    (e.target as HTMLFormElement).reset();
  };

  const tryLogin = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setAdminOverlay(false);
      setAdminErr(false);
      loadSubs();
      fetchStats();
      setAdminDash(true);
    } else {
      setAdminErr(true);
    }
  };

  const filteredCatalog = CATALOG.filter(
    (c) => filter === "all" || c.cat === filter,
  );

  const faqItems = [
    { q: "faq.q1", a: "faq.a1" },
    { q: "faq.q2", a: "faq.a2" },
    { q: "faq.q3", a: "faq.a3" },
    { q: "faq.q4", a: "faq.a4" },
  ];

  return (
    <div ref={rootRef} className="wi">
      <header>
        <nav className="wrap">
          <a href="#" className="logo">
            <img src="/assets/logo-icon.png" alt="WebInvite" />
            WebInvite<span>.</span>
          </a>
          <div className="nav-links">
            <a href="#catalog">{t("nav.catalog")}</a>
            <a href="#how">{t("nav.how")}</a>
            <a href="#pricing">{t("nav.pricing")}</a>
            <a href="#faq">{t("nav.faq")}</a>
            <a href="#contact">{t("nav.contact")}</a>
          </div>
          <div className="nav-right">
            <div className="lang-switch">
              {(["uz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  className={lang === l ? "active" : ""}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="icon-btn"
              title="Rejim"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
              </svg>
            </button>
            <button
              className="icon-btn"
              title="Musiqa"
              onClick={toggleAudio}
              style={{
                opacity: audioMissing ? 0.4 : 1,
                color: audioOn ? "var(--wax)" : "var(--ink)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <a href="#contact" className="btn btn-seal nav-cta">
              {t("nav.cta")}
            </a>
          </div>
        </nav>
      </header>

      <audio
        ref={audioRef}
        loop
        preload="none"
        onError={() => setAudioMissing(true)}
      >
        <source src="/audio/background.mp3" type="audio/mpeg" />
      </audio>

      <main>
        <section className="hero">
          <svg
            className="corner-flourish tl"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 10C40 30 30 70 55 85C80 100 95 70 120 80"
              stroke="var(--gold)"
              strokeWidth={1.4}
            />
            <circle cx="55" cy="85" r="5" fill="var(--gold)" />
            <circle cx="30" cy="40" r="3" fill="var(--wax)" />
            <circle cx="95" cy="60" r="3" fill="var(--wax)" />
            <path d="M20 20C25 35 35 32 40 45" stroke="var(--gold)" strokeWidth={1} />
          </svg>
          <svg
            className="corner-flourish br"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 10C40 30 30 70 55 85C80 100 95 70 120 80"
              stroke="var(--gold)"
              strokeWidth={1.4}
            />
            <circle cx="55" cy="85" r="5" fill="var(--gold)" />
            <circle cx="30" cy="40" r="3" fill="var(--wax)" />
            <circle cx="95" cy="60" r="3" fill="var(--wax)" />
          </svg>
          <div className="petals">
            {petals.map((p, i) => (
              <div
                key={i}
                className="petal"
                style={{
                  left: p.left + "%",
                  animationDuration: p.dur + "s",
                  animationDelay: p.delay + "s",
                }}
              >
                <svg width={p.size} height={p.size} viewBox="0 0 20 20">
                  <path
                    d="M10 0C14 6 20 8 10 20C0 8 6 6 10 0Z"
                    fill={p.color}
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow">{t("hero.eyebrow")}</div>
              <h1>{renderHtml(t("hero.title"))}</h1>
              <p className="lede">{t("hero.lede")}</p>
              <div className="hero-actions">
                <a href="#catalog" className="btn btn-seal">
                  {t("hero.cta1")}
                </a>
                <a href="#contact" className="btn btn-ghost">
                  {t("hero.cta2")}
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <b>20+</b>
                  <span>{t("hero.stat1")}</span>
                </div>
                <div className="stat">
                  <b>24 {lang === "uz" ? "soat" : lang === "ru" ? "ч" : "h"}</b>
                  <span>{t("hero.stat2")}</span>
                </div>
                <div className="stat">
                  <b>4</b>
                  <span>{t("hero.stat3")}</span>
                </div>
              </div>
            </div>
            <div className="envelope-stage">
              <div
                className={"envelope" + (envelopeOpen ? " open" : "")}
                onClick={() => setEnvelopeOpen((v) => !v)}
              >
                <div className="env-back"></div>
                <div className="env-card">
                  <div className="card-eyebrow">{t("hero.env.eyebrow")}</div>
                  <h3>Madina &amp; Sardor</h3>
                  <p>{t("hero.env.text")}</p>
                </div>
                <div className="env-flap"></div>
                <div className="seal">W</div>
                <div className="env-hint">{t("hero.env.hint")}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="catalog" id="catalog">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">{t("cat.eyebrow")}</div>
              <h2>{t("cat.title")}</h2>
            </div>
            <div className="filters reveal">
              {(["all", "wedding", "party", "other"] as const).map((f) => (
                <button
                  key={f}
                  className={"filter-btn" + (filter === f ? " active" : "")}
                  onClick={() => setFilter(f)}
                >
                  {t("filter." + f)}
                </button>
              ))}
            </div>
            <div className="grid-cat">
              {filteredCatalog.map((c, i) => (
                <div className="cat-card reveal" key={i}>
                  <div className="cat-thumb">
                    <span className="tag">{t(c.tagKey)}</span>
                    <div className="mini-stage">
                      <div className="mini-frame desktop">
                        <img src={c.img} alt={c.title} loading="lazy" />
                      </div>
                      <div className="mini-frame tablet">
                        <img src={c.img} alt="" loading="lazy" />
                      </div>
                      <div className="mini-frame phone">
                        <img src={c.img} alt="" loading="lazy" />
                      </div>
                    </div>
                  </div>
                  <div className="cat-body">
                    <h3>{c.title}</h3>
                    <p>{t(c.descKey)}</p>
                    <a
                      className="cat-link"
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lang === "uz"
                        ? "Ko'rish"
                        : lang === "ru"
                          ? "Смотреть"
                          : "View"}{" "}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 44 }}>
              <a href="#contact" className="btn btn-ghost">
                {t("cat.more")}
              </a>
            </div>
          </div>
        </section>

        <section className="devices">
          <div className="wrap">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              <span>{t("dev.eyebrow")}</span>
            </div>
            <h2>{t("dev.title")}</h2>
            <div className="device-stage reveal">
              <div className="frame desktop">
                <img src={CATALOG[0].img} alt="Desktop" loading="lazy" />
              </div>
              <div className="frame tablet">
                <img src={CATALOG[1].img} alt="Tablet" loading="lazy" />
              </div>
              <div className="frame phone">
                <img src={CATALOG[2].img} alt="Phone" loading="lazy" />
              </div>
            </div>
            <p className="device-caption">{t("dev.caption")}</p>
          </div>
        </section>

        <section className="process" id="how">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">{t("how.eyebrow")}</div>
              <h2>{t("how.title")}</h2>
            </div>
            <div className="steps">
              {(["I", "II", "III"] as const).map((n, i) => (
                <div className="step reveal" key={n}>
                  <span className="num">{n}</span>
                  <h3>{t(`how.s${i + 1}.title`)}</h3>
                  <p>{t(`how.s${i + 1}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="wrap">
            <div
              className="section-head reveal"
              style={{ textAlign: "center", maxWidth: "100%" }}
            >
              <div className="eyebrow" style={{ justifyContent: "center" }}>
                <span>{t("price.eyebrow")}</span>
              </div>
              <h2>{t("price.title")}</h2>
            </div>
            <div className="price-grid">
              <div className="price-card reveal">
                <span className="price-badge">{t("price.standard.badge")}</span>
                <h3>{t("price.standard.title")}</h3>
                <div className="price-amount">
                  100 000 <span style={{ fontSize: 16 }}>so'm</span>
                </div>
                <p className="price-note">{t("price.standard.note")}</p>
                <ul>
                  <li>{t("price.standard.li1")}</li>
                  <li>{t("price.standard.li2")}</li>
                  <li>{t("price.standard.li3")}</li>
                  <li>{t("price.standard.li4")}</li>
                </ul>
                <a href="#contact" className="btn btn-seal submit-btn">
                  {t("price.cta")}
                </a>
              </div>
              <div className="price-card price-card-premium reveal">
                <span className="price-badge price-badge-premium">
                  {t("price.premium.badge")}
                </span>
                <h3>{t("price.premium.title")}</h3>
                <div className="price-amount price-amount-custom">
                  {lang === "uz"
                    ? "So'rov asosida"
                    : lang === "ru"
                      ? "По запросу"
                      : "On request"}
                </div>
                <p className="price-note">{t("price.premium.note")}</p>
                <ul>
                  <li>{t("price.premium.li1")}</li>
                  <li>{t("price.premium.li2")}</li>
                  <li>{t("price.premium.li3")}</li>
                  <li>{t("price.premium.li4")}</li>
                </ul>
                <a href="#contact" className="btn btn-ghost submit-btn">
                  {t("price.cta.consult")}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">{t("faq.eyebrow")}</div>
              <h2>{t("faq.title")}</h2>
            </div>
            <div className="faq-list reveal">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className={"faq-item" + (openFaq === i ? " open" : "")}
                >
                  <button
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{t(item.q)}</span>
                    <span className="plus">+</span>
                  </button>
                  <div className="faq-a">
                    <p>{t(item.a)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap contact-grid">
            <div className="reveal">
              <div className="eyebrow">{t("contact.eyebrow")}</div>
              <h2>{t("contact.title")}</h2>
              <p
                style={{
                  color: "var(--ink-soft)",
                  marginTop: 18,
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {t("contact.lede")}
              </p>
              <div className="channels">
                <a
                  className="channel"
                  href="https://instagram.com/webinvite.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      width={20}
                      height={20}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </span>
                  <span className="ch-text">
                    <b>Instagram</b>
                    <span>@webinvite.uz</span>
                  </span>
                </a>
                <a
                  className="channel"
                  href="https://t.me/erkaqizgina1317"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      width={20}
                      height={20}
                      fill="currentColor"
                    >
                      <path d="M21.5 3.5L2.7 10.8c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.2-.5-1.7-1.6-1.5zM8.4 13.6l9.3-5.8c.4-.3.8-.1.5.2l-7.9 7.1-.3 3.1-1.6-4.6z" />
                    </svg>
                  </span>
                  <span className="ch-text">
                    <b>Telegram</b>
                    <span>@erkaqizgina1317</span>
                  </span>
                </a>
                <a className="channel" href="mailto:ruxshonazakiryayeva@gmail.com">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      width={20}
                      height={20}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                  <span className="ch-text">
                    <b>Email</b>
                    <span>ruxshonazakiryayeva@gmail.com</span>
                  </span>
                </a>
              </div>
            </div>
            <form className="card-form reveal" onSubmit={submitOrder}>
              <p style={{ display: "none" }}>
                <label>
                  Bot: <input name="bot-field" />
                </label>
              </p>
              <div className="field">
                <label>{t("form.name")}</label>
                <input type="text" name="name" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label>{t("form.phone")}</label>
                  <input type="tel" name="phone" required />
                </div>
                <div className="field">
                  <label>{t("form.event")}</label>
                  <select name="event" defaultValue={t("form.event1")}>
                    <option>{t("form.event1")}</option>
                    <option>{t("form.event2")}</option>
                    <option>{t("form.event3")}</option>
                    <option>{t("form.event4")}</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{t("form.msg")}</label>
                <textarea name="message" rows={3} />
              </div>
              <button
                type="submit"
                className="btn btn-seal submit-btn"
                disabled={formSending}
              >
                {t("form.submit")}
              </button>
              {formStatus && (
                <p
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: "var(--wax)",
                  }}
                >
                  {formStatus}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <a href="#" className="logo">
                <img src="/assets/logo-icon.png" alt="WebInvite" />
                WebInvite<span>.</span>
              </a>
              <p className="foot-desc">{t("foot.desc")}</p>
              <p className="foot-follow">{t("foot.follow")}</p>
              <div className="share-row">
                <a
                  href="https://t.me/webinvite_uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    fill="currentColor"
                  >
                    <path d="M21.5 3.5L2.7 10.8c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.2-.5-1.7-1.6-1.5zM8.4 13.6l9.3-5.8c.4-.3.8-.1.5.2l-7.9 7.1-.3 3.1-1.6-4.6z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/webinvite.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </a>
                <a href="mailto:ruxshonazakiryayeva@gmail.com" title="Email">
                  <svg
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4>{t("foot.links")}</h4>
              <ul>
                <li>
                  <a href="#catalog">{t("nav.catalog")}</a>
                </li>
                <li>
                  <a href="#how">{t("nav.how")}</a>
                </li>
                <li>
                  <a href="#faq">{t("nav.faq")}</a>
                </li>
                <li>
                  <a href="#contact">{t("nav.contact")}</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>{t("foot.contact")}</h4>
              <ul>
                <li>+998 93 905-13-17</li>
                <li>ruxshonazakiryayeva@gmail.com</li>
                <li>{t("foot.city")}</li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>
              © 2026 WebInvite. {t("foot.rights")}
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <span>{t("foot.made")}</span>
              <button
                className="admin-key"
                title="Admin"
                onClick={() => {
                  setAdminOverlay(true);
                  setAdminPass("");
                  setAdminErr(false);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={15}
                  height={15}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="8" cy="15" r="3" />
                  <path d="M10.5 12.5L20 3M16 7l3 3M20 3l1 1" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </footer>

      {adminOverlay && (
        <div
          className="admin-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAdminOverlay(false);
          }}
        >
          <div className="admin-box">
            <h3>Admin kirish</h3>
            <p>Bu bo'lim faqat sayt egasi uchun.</p>
            <input
              type="password"
              placeholder="Parol"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryLogin()}
              autoFocus
            />
            {adminErr && <p className="admin-err">Parol noto'g'ri.</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-seal"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={tryLogin}
              >
                Kirish
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setAdminOverlay(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {adminDash && (
        <div className="admin-dash">
          <div className="admin-dash-inner">
            <div className="admin-dash-head">
              <h2>Admin panel</h2>
              <button
                className="btn btn-ghost"
                onClick={() => setAdminDash(false)}
              >
                Chiqish
              </button>
            </div>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <b>{visitsToday}</b>
                <span>Bugun saytga kirganlar</span>
              </div>
              <div className="admin-stat-card">
                <b>{visitsTotal}</b>
                <span>Jami tashriflar</span>
              </div>
            </div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: 19,
                marginBottom: 14,
              }}
            >
              So'nggi arizalar
            </h3>
            {subs.length === 0 ? (
              <p className="admin-note">Hozircha ariza yo'q.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Ism</th>
                    <th>Telefon</th>
                    <th>Tadbir</th>
                    <th>Xabar</th>
                  </tr>
                </thead>
                <tbody>
                  {subs
                    .slice()
                    .reverse()
                    .map((s, i) => (
                      <tr key={i}>
                        <td>
                          {new Date(s.created_at).toLocaleString("uz-UZ")}
                        </td>
                        <td>{s.name}</td>
                        <td>{s.phone}</td>
                        <td>{s.event}</td>
                        <td>{s.message.slice(0, 60)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
