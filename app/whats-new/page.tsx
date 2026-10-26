"use client";
import { PageIntro, SiteFooter, SiteHeader } from "../ui";
import { tournaments, visuals, displayDate } from "../tournaments";
import { useLang } from "../i18n";
import { CityPhoto, detailHref, dateText } from "../discovery";
// Generated before every build from data/changes/*.json by scripts/prepare-data.mjs
import generated from "../generated/changes.json";

type Change = {
  date: string;
  tournament_id: string;
  change_type: string;
  label_ko?: string | null;
  label_en?: string | null;
  before_ko?: string | null;
  after_ko?: string | null;
  before_en?: string | null;
  after_en?: string | null;
  summary_ko: string;
  summary_en: string;
};

const typeLabels: Record<string, [string, string]> = {
  NEW: ["신규 대회", "NEW"],
  REGISTRATION_OPENED: ["접수 시작", "REGISTRATION OPENED"],
  CLOSING_SOON: ["마감 임박", "CLOSING SOON"],
  DATE_CHANGED: ["일정 변경", "DATE CHANGED"],
  REGISTRATION_CLOSED: ["접수 종료", "REGISTRATION CLOSED"],
  PAST: ["종료 · 지난 대회로 이동", "PAST · MOVED TO ARCHIVE"],
  CANCELLED: ["대회 취소", "CANCELLED"],
  NEEDS_REVIEW: ["확인 필요", "NEEDS REVIEW"],
  OTHER: ["정보 업데이트", "UPDATE"],
};

const changes = (generated.changes as Change[])
  .filter((c) => tournaments.some((t) => t.id === c.tournament_id))
  .sort((a, b) => b.date.localeCompare(a.date));
const latest = changes[0]?.date ?? null;
const headlines = generated.headlines as Record<string, { ko: string | null; en: string | null }>;

export default function NewPage() {
  const { lang } = useLang();
  const ko = lang === "ko";
  const headline = latest ? headlines[latest] : null;
  return (
    <main>
      <SiteHeader active="What’s New" />
      <PageIntro
        eyebrow={latest ? (ko ? `${dateText(latest, true)} 자료 반영` : `UPDATE · ${displayDate(latest).toUpperCase()}`) : ko ? "새소식" : "UPDATES"}
        title={ko ? "새소식" : "What’s new."}
        text={(ko ? headline?.ko : headline?.en) ?? (ko ? "주간 대회 정보 변경 내역입니다." : "Weekly tournament information updates.")}
      />
      <section className="route-content">
        <div className="updates-list">
          {changes.map((c, i) => {
            const t = tournaments.find((x) => x.id === c.tournament_id)!;
            const v = visuals[t.id];
            const label = (ko ? c.label_ko : c.label_en) ?? typeLabels[c.change_type]?.[ko ? 0 : 1] ?? c.change_type;
            const before = ko ? c.before_ko : c.before_en;
            const after = ko ? c.after_ko : c.after_en;
            return (
              <article key={c.date + c.tournament_id + i}>
                <CityPhoto t={t} className="news-photo" />
                <span className="update-type">{label}</span>
                <time>{c.date}</time>
                <h2>{t.name}</h2>
                {before && after && (
                  <div className="change-comparison">
                    <span>{before}</span>
                    <b>→ {after}</b>
                  </div>
                )}
                <p>{ko ? `${v.cityKo}, ${v.countryKo}. ${c.summary_ko}` : `${t.city}, ${t.country}. ${c.summary_en}`}</p>
                <a className="news-source" href={t.sourceUrl} target="_blank" rel="noreferrer">
                  {ko ? "공식 출처" : "Official source"}
                </a>
                <a className="news-details" href={detailHref(t.id)}>
                  {ko ? "대회 상세정보" : "Tournament details"} →
                </a>
              </article>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
