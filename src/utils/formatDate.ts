/**
 * utils/formatDate.ts
 * ------------------------------------------------------------------
 * API mengembalikan tanggal dalam format tampilan ("8 January 2026"),
 * sedangkan <input type="date"> butuh "2026-01-08". Fungsi di sini
 * menjembatani keduanya.
 */

const MONTHS_EN: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const MONTHS_ID: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
};

const MONTH_LABELS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** "8 January 2026" / "8 Januari 2026" / "2026-01-08" -> "2026-01-08". */
export function toIsoDate(value: string | null | undefined): string {
  if (!value) return "";
  const raw = value.trim();
  if (raw === "") return "";

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;

  const named = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const monthName = named[2]!.toLowerCase();
    const month = MONTHS_EN[monthName] ?? MONTHS_ID[monthName];
    if (month) return `${named[3]}-${pad(month)}-${pad(Number(named[1]))}`;
  }

  return "";
}

/** "2026-01-08" -> "8 January 2026" (dipakai kalau butuh format tampilan). */
export function toDisplayDate(value: string | null | undefined): string {
  const iso = toIsoDate(value);
  if (!iso) return value ?? "";
  const [year, month, day] = iso.split("-");
  const label = MONTH_LABELS_EN[Number(month) - 1] ?? month;
  return `${Number(day)} ${label} ${year}`;
}

/** Rentang tanggal untuk kolom tabel: "8 – 10 January 2026". */
export function formatRange(start: string, end: string): string {
  const isoStart = toIsoDate(start);
  const isoEnd = toIsoDate(end);
  if (!isoStart || !isoEnd) return `${start} – ${end}`;
  if (isoStart === isoEnd) return toDisplayDate(isoStart);

  const [sy, sm, sd] = isoStart.split("-");
  const [ey, em, ed] = isoEnd.split("-");

  if (sy === ey && sm === em) {
    return `${Number(sd)} – ${Number(ed)} ${MONTH_LABELS_EN[Number(sm) - 1]} ${sy}`;
  }
  return `${toDisplayDate(isoStart)} – ${toDisplayDate(isoEnd)}`;
}

/** Nama bulan + tahun dari tanggal API, mis. "January 2026". */
export function monthLabel(value: string): string {
  const iso = toIsoDate(value);
  if (!iso) return "-";
  const [year, month] = iso.split("-");
  return `${MONTH_LABELS_EN[Number(month) - 1] ?? month} ${year}`;
}

/** Tanggal ISO hari ini (untuk default form). */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
