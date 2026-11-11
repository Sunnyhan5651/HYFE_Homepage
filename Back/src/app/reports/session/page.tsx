import { ReportsBoardPage } from "@/components/reports/ReportsBoardPage";

export default function SessionReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <ReportsBoardPage
      title="세션 자료"
      lead="정규 세션과 신입 교육에서 활용한 공개 가능한 학습 자료입니다."
      current="세션 자료"
      activePath="/reports/session"
      fixedCategory="session"
      searchParams={searchParams}
    />
  );
}
