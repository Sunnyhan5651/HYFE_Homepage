import { ReportsBoardPage } from "@/components/reports/ReportsBoardPage";

export default function IndustryReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <ReportsBoardPage
      title="산업 리서치"
      lead="산업 구조, 수요 변수, 밸류체인 변화를 중심으로 정리한 리서치입니다."
      current="산업 리서치"
      activePath="/reports/industry"
      fixedCategory="industry"
      searchParams={searchParams}
    />
  );
}
