import Link from "next/link";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { requireRole } from "@/lib/auth/session";
import { banners, memberTabs, teamCards, withActive } from "@/lib/content/site-content";

export const dynamic = "force-dynamic";

export default async function MemberPage() {
  let userName = "";
  try {
    const user = await requireRole("MEMBER");
    userName = user.name;
  } catch (error) {
    return (
      <main>
        <SubHero title="MEMBER" subtitle="회원 전용 페이지입니다." image={banners.memberTeam} parent="Member" current="로그인 필요" />
        <section className="section container">
          <div className="noteBox">
            <h2>로그인이 필요합니다</h2>
            <p className="muted">{(error as Error).message}</p>
            <div className="actionRow">
              <Link className="button" href="/login">
                로그인
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <SubHero
        title="MEMBER"
        subtitle="팀별 리서치와 학회원 자료를 관리합니다."
        image={banners.memberTeam}
        parent="Member"
        current="팀 게시판"
      />
      <SubNavigation section="MEMBER" links={withActive(memberTabs, "/member/teams/research")} />
      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <h2>{userName}님, HYFE Member Portal</h2>
            <p className="sectionLead">팀 게시판, 시황, 면접 후기를 확인할 수 있습니다.</p>
          </div>
          <div className="featureGrid four">
            {teamCards.map((card) => (
              <Link className="featureCard" href={card.href} key={card.title}>
                <span className="miniIcon">{card.title.slice(0, 1)}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </Link>
            ))}
          </div>
          <div className="actionRow">
            <Link className="button" href="/member/market">
              시황 보기
            </Link>
            <Link className="button" href="/member/interviews">
              면접 후기 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
