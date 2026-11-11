import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { aboutTabs, banners, historyFallback, withActive } from "@/lib/content/site-content";
import { loadDemoDatabase } from "@/lib/db/local-store";

type SearchParams = Record<string, string | string[] | undefined>;

const periodTabs = [
  { value: "recent", label: "2024-현재" },
  { value: "2021-2023", label: "2021-2023" },
  { value: "2018-2020", label: "2018-2020" },
  { value: "archive", label: "Archive" },
] as const;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function inPeriod(year: number, period: string): boolean {
  if (period === "2021-2023") return year >= 2021 && year <= 2023;
  if (period === "2018-2020") return year >= 2018 && year <= 2020;
  if (period === "archive") return year < 2018;
  return year >= 2024;
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const db = await loadDemoDatabase();
  const period = firstParam((await searchParams).period) || "recent";
  const grouped = db.historyEvents.length
    ? Object.values(
        db.historyEvents.reduce<Record<string, { year: number; term: string; events: Array<{ month: string; body: string }> }>>(
          (acc, item) => {
            const key = `${item.year}-${item.termLabel ?? "HYFE"}`;
            acc[key] ??= { year: item.year, term: item.termLabel ?? "HYFE", events: [] };
            acc[key].events.push({ month: item.month ? `${String(item.month).padStart(2, "0")}월` : "활동", body: item.content });
            return acc;
          },
          {},
        ),
      ).sort((a, b) => b.year - a.year)
    : historyFallback;
  const visibleGrouped = grouped.filter((item) => inPeriod(item.year, period));

  return (
    <main>
      <SubHero
        title="HISTORY"
        subtitle="HYFE가 축적해 온 연구와 도전의 기록"
        image={banners.history}
        parent="About"
        current="History"
      />
      <SubNavigation section="ABOUT" links={withActive(aboutTabs, "/history")} />

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">HISTORY</span>
            <h2>연혁 및 주요 활동</h2>
          </div>
          <div className="actionRow">
            {periodTabs.map((tab) => (
              <a className={period === tab.value ? "tag" : "button secondary small"} href={`/history?period=${tab.value}`} key={tab.value}>
                {tab.label}
              </a>
            ))}
          </div>
          <div className="timeline" style={{ marginTop: 28 }}>
            {visibleGrouped.map((item) => (
              <article className="timelineItem" key={`${item.year}-${item.term}`}>
                <div className="timelineYear">
                  <strong>{item.year}</strong>
                  <span>{item.term}</span>
                </div>
                <ul className="timelineEvents">
                  {item.events.map((event) => (
                    <li key={`${event.month}-${event.body}`}>
                      <b>{event.month}</b>
                      <span>{event.body}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            {visibleGrouped.length === 0 ? (
              <div className="summaryBox">
                <h3>해당 기간의 연혁이 없습니다.</h3>
                <p className="muted">관리자 화면에서 연혁 데이터를 추가하면 이 영역에 표시됩니다.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
