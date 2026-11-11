import { ReportsBoardPage } from "@/components/reports/ReportsBoardPage";

export default function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <ReportsBoardPage
      title="공개 레포트"
      lead="HYFE 학회원이 작성한 기업·산업 리서치 자료를 공개합니다."
      current="공개 레포트"
      activePath="/reports"
      searchParams={searchParams}
    />
  );
}
