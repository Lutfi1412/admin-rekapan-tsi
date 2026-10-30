import { Building2, CalendarClock, MonitorSmartphone, Users } from "lucide-react";
import type { NarsumItem } from "../../services/narsumService";
import { toIsoDate } from "../../utils/formatDate";

interface StatCardsProps {
  items: NarsumItem[];
}

function countThisMonth(items: NarsumItem[]): number {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return items.filter((item) => toIsoDate(item["Tanggal Mulai"]).startsWith(prefix)).length;
}

export function StatCards({ items }: StatCardsProps) {
  const total = items.length;
  const online = items.filter((item) => item["Mode Pelaksanaan"].toLowerCase() === "online").length;
  const offline = items.filter((item) => item["Mode Pelaksanaan"].toLowerCase() === "offline").length;
  const instansi = new Set(items.map((item) => item.Instansi.trim().toLowerCase())).size;
  const thisMonth = countThisMonth(items);

  const cards = [
    {
      label: "Total kegiatan",
      value: total,
      hint: "seluruh data tersimpan",
      icon: Users,
      accent: "from-indigo-500 to-violet-500",
      chip: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Narasumber unik",
      value: new Set(items.map((item) => item.Nama.trim().toLowerCase())).size,
      hint: `${instansi} instansi terlibat`,
      icon: Building2,
      accent: "from-sky-500 to-cyan-500",
      chip: "text-sky-600 bg-sky-50",
    },
    {
      label: "Mode pelaksanaan",
      value: `${online} / ${offline}`,
      hint: "kegiatan online / offline",
      icon: MonitorSmartphone,
      accent: "from-emerald-500 to-teal-500",
      chip: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Kegiatan bulan ini",
      value: thisMonth,
      hint: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      icon: CalendarClock,
      accent: "from-amber-500 to-orange-500",
      chip: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent} opacity-80`}
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-500">{card.hint}</p>
            </div>
            <span className={`flex size-10 items-center justify-center rounded-xl ${card.chip}`}>
              <card.icon className="size-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
