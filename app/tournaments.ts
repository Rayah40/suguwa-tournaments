import source from "../data/tournaments.json";
export type Status =
  | "ANNOUNCED"
  | "UPCOMING"
  | "OPEN"
  | "CLOSING_SOON"
  | "CLOSED"
  | "PAST"
  | "CANCELLED"
  | "UNKNOWN";
export type Tournament = {
  id: string;
  collection: number;
  series: string | null;
  name: string;
  city: string;
  country: string;
  region: string;
  start: string | null;
  dateNeedsReview?: boolean;
  dateNote?: string | null;
  end: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  status: Status;
  deadline: string | null;
  entry: string[];
  category: string[];
  gender: string | null;
  age: string | null;
  fee: string | null;
  venue: string | null;
  organizer: string;
  international: boolean | null;
  notes: string;
  format: string | null;
  formatNote: string | null;
  officialUrl: string;
  registrationUrl: string | null;
  teamRegistrationUrl?: string | null;
  individualRegistrationUrl?: string | null;
  sourceUrl: string;
  verified: string;
  verification: "VERIFIED" | "NEEDS_REVIEW";
  registrationPhase?: string | null;
  checked?: string;
  sourceUrls?: string[];
  registrationOpen?: string | null;
  registrationNote?: string | null;
  teamStatus?: Status | null;
  individualStatus?: Status | null;
  teamDeadline?: string | null;
  individualDeadline?: string | null;
  deadlineZone?: string | null;
};
// ---------------------------------------------------------------------------
// Data comes from data/tournaments.json (the weekly agent output).
// Do not edit tournament details here; replace the JSON file instead.
// ---------------------------------------------------------------------------

type Raw = (typeof source.tournaments)[number] & Record<string, unknown>;
type RawRecord = Record<string, any>;

const title = (v: string) =>
  v.split("_").map((w, i) => /\d/.test(w) || w === "USAWP" ? w : i > 0 && ["ON", "WITH", "OF", "AND"].includes(w) ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
const list = (v: unknown) => (Array.isArray(v) ? (v as string[]).map(title) : []);
const status = (v: unknown): Status => (typeof v === "string" && v ? (v as Status) : "UNKNOWN");
const optStatus = (v: unknown): Status | null => (typeof v === "string" && v ? (v as Status) : null);
const feeText = (t: RawRecord): string | null => {
  if (t.entry_fee_note) return t.entry_fee_note;
  if (typeof t.entry_fee !== "number" || !t.currency) return null;
  return t.entry_fee === 0 ? `Free (${t.currency} 0)` : `${t.currency} ${t.entry_fee.toLocaleString("en-US")}`;
};

function toTournament(r: Raw): Tournament {
  const t = r as RawRecord;
  return {
    id: t.tournament_id,
    collection: t.collection_no,
    series: t.series ?? null,
    name: t.name,
    city: t.city,
    country: t.country,
    region: t.region,
    start: t.water_polo_start_date ?? null,
    end: t.water_polo_end_date ?? null,
    eventStart: t.start_date ?? null,
    eventEnd: t.end_date ?? null,
    dateNeedsReview: Boolean(t.date_note && t.water_polo_start_date),
    dateNote: t.date_note ?? null,
    status: status(t.registration_status),
    deadline: t.registration_deadline ?? null,
    entry: list(t.entry_type),
    category: list(t.category),
    gender: Array.isArray(t.gender) && t.gender.length ? list(t.gender).join(" · ") : null,
    age: t.age_category ?? null,
    fee: feeText(t),
    venue: t.venue ?? null,
    organizer: t.organizer,
    international: t.international_participants_allowed ?? null,
    notes: t.notes ?? t.registration_note ?? "",
    format: t.competition_format ? title(t.competition_format) : null,
    formatNote: t.format_note ?? null,
    officialUrl: t.official_url,
    registrationUrl: t.registration_url ?? null,
    teamRegistrationUrl: t.team_registration_url ?? null,
    individualRegistrationUrl: t.individual_registration_url ?? null,
    sourceUrl: t.source_url ?? t.official_url,
    sourceUrls: t.source_urls ?? [],
    verified: t.last_verified_at,
    checked: t.last_checked_at ?? undefined,
    verification: t.verification_status === "VERIFIED" ? "VERIFIED" : "NEEDS_REVIEW",
    registrationPhase: t.registration_phase ?? null,
    registrationOpen: t.registration_open_date ?? null,
    registrationNote: [t.registration_note, t.source_access_note].filter(Boolean).join("\n") || null,
    teamStatus: optStatus(t.team_registration_status),
    individualStatus: optStatus(t.individual_registration_status),
    teamDeadline: t.team_registration_deadline ?? null,
    individualDeadline: t.individual_registration_deadline ?? null,
    deadlineZone: t.registration_deadline_timezone ?? null,
  };
}

const sortKey = (t: Tournament) => t.start ?? `${t.id.slice(4, 8)}-99`;
/** Latest event dates first, as on the original site. */
export const tournaments: Tournament[] = (source.tournaments as Raw[])
  .map(toTournament)
  .sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || a.collection - b.collection);
/** Date the agent produced the dataset (shown as "Data checked"). */
export const dataCheckedAt: string = source.generated_at;
export const activeTournaments = tournaments.filter(
  (t) => t.status !== "PAST" && t.status !== "CANCELLED",
);
export const archivedTournaments = tournaments.filter(
  (t) => t.status === "PAST" || t.status === "CANCELLED",
);
export const collectionNumber = (id: string) =>
  String(tournaments.find((t) => t.id === id)?.collection ?? 0).padStart(2, "0");
export const statusLabel = (s: Status) =>
  s === "UNKNOWN" ? "STATUS UNCONFIRMED" : s.replaceAll("_", " ");
export const displayDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${iso}T00:00:00Z`))
    : "TBA";
export const dateRange = (a: string | null, b: string | null) =>
  !a
    ? "Dates to be announced"
    : a === b
      ? displayDate(a)
      : `${displayDate(a)} – ${displayDate(b)}`;
export const statusKo: Record<Status, string> = {
  ANNOUNCED: "개최 확정",
  UPCOMING: "접수 예정",
  OPEN: "접수 중",
  CLOSING_SOON: "마감 임박",
  CLOSED: "접수 종료",
  PAST: "종료",
  CANCELLED: "취소",
  UNKNOWN: "접수 상태 미확인",
};
type Visual = {
  image: string | null;
  source: string | null;
  flag: string;
  cityKo: string;
  countryKo: string;
  notesKo: string;
  formatKo?: string;
  credit?: string;
  licenseUrl?: string;
  registrationKo?: string;
  dateNoteKo?: string;
};
export const visuals: Record<string, Visual> = Object.fromEntries(
  (source.tournaments as RawRecord[]).map((t) => [
    t.tournament_id,
    {
      image: t.visual?.image_url ?? null,
      source: t.visual?.source_page ?? null,
      credit: t.visual?.credit ?? undefined,
      licenseUrl: t.visual?.license_url ?? undefined,
      flag: `https://flagcdn.com/w80/${t.country_code}.png`,
      cityKo: t.ko.city,
      countryKo: t.ko.country,
      notesKo: t.ko.notes,
      registrationKo: t.ko.registration ?? undefined,
      formatKo: t.ko.format ?? undefined,
      dateNoteKo: t.ko.date_note ?? undefined,
    } satisfies Visual,
  ]),
);
