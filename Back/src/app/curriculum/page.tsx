import Link from "next/link";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { aboutTabs, banners, onboardingSteps, researchTracks, withActive } from "@/lib/content/site-content";

export default function CurriculumPage() {
  return (
    <main>
      <SubHero
        title="CURRICULUM"
        subtitle="금융공학과 투자 리서치를 단계적으로 학습합니다."
        image={banners.curriculum}
        parent="About"
        current="Curriculum"
      />
      <SubNavigation section="ABOUT" links={withActive(aboutTabs, "/curriculum")} />

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">CURRICULUM</span>
            <h2>신입 교육부터 정규 리서치까지 이어지는 학습 체계</h2>
            <p className="sectionLead">
              HYFE는 신입 교육, 트랙별 스터디, 정규 세션, 알럼나이 멘토링을 통해 금융시장 분석 역량을 단계적으로 쌓습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>Onboarding Program</h2>
          </div>
          <div className="stepTimeline">
            {onboardingSteps.map((step) => (
              <article className="stepCard" key={step.week}>
                <b>{step.week}</b>
                <div>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.body}</p>
                </div>
                <span className="miniIcon">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <h2>Research Tracks</h2>
            <p className="sectionLead">각 트랙은 세션 발표와 결과물 제작을 목표로 운영됩니다.</p>
          </div>
          <table className="dataTable">
            <thead>
              <tr>
                <th>Track</th>
                <th>Core Topic</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {researchTracks.map((track) => (
                <tr key={track.track}>
                  <td>{track.track}</td>
                  <td>{track.topic}</td>
                  <td>{track.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container featureGrid">
          <article className="infoCard">
            <span className="miniIcon">S</span>
            <h3>정규 세션</h3>
            <p>팀별 리서치 발표와 토론을 통해 투자 아이디어를 검증합니다.</p>
            <div className="actionRow">
              <span className="tag">주간 발표</span>
              <span className="tag">피드백</span>
              <span className="tag">리포트</span>
            </div>
          </article>
          <article className="infoCard">
            <span className="miniIcon">M</span>
            <h3>멘토링 / 세미나</h3>
            <p>현업 알럼나이와 함께 산업, 직무, 리서치 방법론을 다룹니다.</p>
            <div className="actionRow">
              <span className="tag">알럼나이 특강</span>
              <span className="tag">연합 세션</span>
              <span className="tag">커리어 토크</span>
            </div>
          </article>
        </div>
      </section>

      <section className="sectionTight">
        <div className="container noteBox">
          <h3>참고사항</h3>
          <ul>
            <li>신입 교육은 리크루팅 이후 4주 동안 진행됩니다.</li>
            <li>정규 팀 배정 후 학기별 리서치 결과물을 제출합니다.</li>
            <li>최종 발표와 피드백을 통해 정규 활동을 마무리합니다.</li>
          </ul>
          <div className="actionRow">
            <Link className="button secondary" href="/recruiting">
              리크루팅 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
