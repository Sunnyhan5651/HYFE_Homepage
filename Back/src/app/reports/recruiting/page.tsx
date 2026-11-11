import { ReportsBoardPage } from "@/components/reports/ReportsBoardPage";

export default function RecruitingReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <ReportsBoardPage
      title="리크루팅 자료"
      lead="지원 전 확인할 수 있는 학회 안내자료와 모집 관련 자료입니다."
      current="리크루팅 자료"
      activePath="/reports/recruiting"
      boardType="RECRUIT_MATERIAL"
      fixedCategory="guide"
      searchParams={searchParams}
    />
  );
}
