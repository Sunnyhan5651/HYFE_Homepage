import Link from "next/link";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { banners, recruitingQualities, recruitingSteps, recruitingTabs, withActive } from "@/lib/content/site-content";
import { loadDemoDatabase } from "@/lib/db/local-store";
import { listPosts } from "@/lib/db/post-repository";
import { activeRecruitmentAsset, RECRUITMENT_ASSET_CONFIG } from "@/lib/recruiting/assets";

export default async function RecruitingPage() {
  const db = await loadDemoDatabase();
  const applicationAsset = activeRecruitmentAsset(db.recruitmentAssets, "APPLICATION_FORM");
  const guideAsset = activeRecruitmentAsset(db.recruitmentAssets, "RECRUITING_GUIDE");
  const materials = await listPosts("RECRUIT_MATERIAL");

  return (
    <main>
      <SubHero
        title="RECRUITING"
        subtitle="HYFE와 함께 금융시장을 연구할 신입 학회원을 기다립니다."
        image={banners.recruiting}
        parent="Recruiting"
        current="모집 안내"
      />
      <SubNavigation section="RECRUITING" links={withActive(recruitingTabs, "/recruiting")} />

      <section className="section">
        <div className="container">
          <div className="infoCard">
            <div className="sectionHeader">
              <span className="tag">지원 예정</span>
              <h2>2026 상반기 신입 학회원 모집</h2>
              <p className="sectionLead">금융시장과 투자 리서치를 함께 공부할 학회원의 지원을 기다립니다.</p>
            </div>
            <div className="featureGrid">
              {[
                ["서류 접수", "2026.03.02-03.10"],
                ["인터뷰", "2026.03.14-03.15"],
                ["합격 발표", "2026.03.18"],
              ].map(([title, date]) => (
                <article className="dateCard" key={title}>
                  <span className="miniIcon">D</span>
                  <h3>{title}</h3>
                  <p>{date}</p>
                </article>
              ))}
            </div>
            <div className="actionRow">
              {applicationAsset ? (
                <a className="button" href={RECRUITMENT_ASSET_CONFIG.APPLICATION_FORM.downloadPath}>
                  {RECRUITMENT_ASSET_CONFIG.APPLICATION_FORM.downloadLabel}
                </a>
              ) : (
                <span className="button">지원서 준비 중</span>
              )}
              {guideAsset ? (
                <a className="button secondary" href={RECRUITMENT_ASSET_CONFIG.RECRUITING_GUIDE.downloadPath}>
                  {RECRUITMENT_ASSET_CONFIG.RECRUITING_GUIDE.downloadLabel}
                </a>
              ) : (
                <span className="button secondary">안내자료 준비 중</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader center">
            <h2>HYFE is looking for</h2>
          </div>
          <div className="featureGrid">
            {recruitingQualities.map((item) => (
              <article className="featureCard" key={item.title}>
                <span className="miniIcon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>
                  {item.subtitle}
                  <br />
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="process">
        <div className="container">
          <div className="sectionHeader">
            <h2>지원 절차</h2>
          </div>
          <div className="stepTimeline">
            {recruitingSteps.map((step) => (
              <article className="stepCard" key={step.title}>
                <b>{step.title}</b>
                <p className="muted">{step.body}</p>
                <span className="miniIcon">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionTight sectionSoft">
        <div className="container noteBox">
          <h3>지원 자격</h3>
          <p className="muted">한양대학교 재학생, 두 학기 이상 활동 가능, 금융·투자·데이터 분석에 관심 있는 분</p>
        </div>
      </section>

      <section className="section" id="materials">
        <div className="container">
          <div className="sectionHeader">
            <h2>리크루팅 자료</h2>
            <p className="sectionLead">지원 전 확인할 수 있는 안내자료와 모집 관련 자료입니다.</p>
          </div>
          <div className="featureGrid">
            {materials.map((material) => (
              <article className="infoCard" key={material.id}>
                <span className="miniIcon">M</span>
                <h3>{material.title}</h3>
                <p>{material.content}</p>
                <div className="actionRow">
                  <Link className="button secondary" href={`/reports/${material.id}`}>
                    자세히 보기
                  </Link>
                  {guideAsset ? (
                    <a className="button" href={RECRUITMENT_ASSET_CONFIG.RECRUITING_GUIDE.downloadPath}>
                      다운로드
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            {materials.length === 0 ? (
              <div className="summaryBox">
                <h3>등록된 안내자료가 없습니다.</h3>
                <p className="muted">관리자 화면에서 리크루팅 자료를 활성화하면 표시됩니다.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="sectionHeader">
            <h2>FAQ</h2>
          </div>
          <div className="stepTimeline">
            {[
              ["지원 자격", "전공과 학년에 관계없이 지원할 수 있습니다."],
              ["전공 제한", "경영, 경제, 공학, 데이터 분석 등 다양한 배경을 환영합니다."],
              ["활동 시간", "정규 세션과 팀 모임 참여가 필요합니다."],
            ].map(([title, body]) => (
              <article className="stepCard" key={title}>
                <b>{title}</b>
                <p className="muted">{body}</p>
                <span className="miniIcon">+</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
