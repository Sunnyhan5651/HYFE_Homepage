import { AccessNotice } from "@/components/auth/AccessNotice";
import { MarketPostEditor } from "@/components/member/MarketPostEditor";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewMarketPostPage() {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>시황 작성</h2>
          <p className="sectionLead">시장 업데이트를 팀 게시판의 시황 자료로 등록합니다.</p>
        </div>
        <MarketPostEditor />
      </div>
    </main>
  );
}
