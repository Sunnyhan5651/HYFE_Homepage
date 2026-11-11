import Link from "next/link";
import Image from "next/image";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { aboutTabs, alumniFields, banners, withActive } from "@/lib/content/site-content";
import { loadDemoDatabase } from "@/lib/db/local-store";

export default async function AlumniPage() {
  const db = await loadDemoDatabase();
  const profiles = db.alumniProfiles.filter((profile) => !profile.deletedAt).slice(0, 3);

  return (
    <main>
      <SubHero
        title="ALUMNI"
        subtitle="현업과 학회를 연결하는 HYFE 네트워크"
        image={banners.alumni}
        parent="About"
        current="Alumni"
      />
      <SubNavigation section="ABOUT" links={withActive(aboutTabs, "/alumni")} />

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">ALUMNI NETWORK</span>
            <h2>금융권과 산업 전반으로 이어지는 HYFE 네트워크</h2>
            <p className="sectionLead">
              알럼나이 세미나, 홈커밍 데이, 멘토링 프로그램을 통해 학회 활동 이후에도 리서치와 커리어 경험을 연결합니다.
            </p>
          </div>
          <div className="imagePanel">
            <Image src={banners.alumni} alt="HYFE 알럼나이 세미나" width={1280} height={520} priority />
          </div>
        </div>
      </section>

      <section className="sectionTight">
        <div className="container statsGrid">
          {[
            ["Alumni", "80+", "현업 선배"],
            ["Firms", "25+", "진출 기관"],
            ["Seminars", "12+", "누적 세미나"],
            ["Career Tracks", "4", "주요 진로"],
          ].map(([label, value, body]) => (
            <article className="statCard" key={label}>
              <span className="statIcon">{label.slice(0, 1)}</span>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>Alumni Fields</h2>
          </div>
          <div className="chartCard">
            <div className="barChart">
              {alumniFields.map((field) => (
                <div className="barRow" key={field.label}>
                  <span>{field.label}</span>
                  <span className="barTrack">
                    <span style={{ width: `${field.value * 2}%` }} />
                  </span>
                  <b>{field.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <h2>Networking Programs</h2>
          </div>
          <div className="featureGrid">
            {["Alumni Talk", "Homecoming Day", "Mentoring Circle"].map((title) => (
              <article className="infoCard" key={title}>
                <span className="miniIcon">{title.slice(0, 1)}</span>
                <h3>{title}</h3>
                <p>현업 경험과 학회 리서치가 만나는 정기 네트워킹 프로그램입니다.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>HYFE Alumni Mentors</h2>
          </div>
          <div className="featureGrid">
            {(profiles.length
              ? profiles.map((profile) => profile.industry)
              : ["운용사 포트폴리오 매니저", "증권사 리서치 애널리스트", "핀테크 데이터 사이언티스트"]
            ).map((role) => (
              <article className="mentorCard" key={role}>
                <span className="miniIcon">M</span>
                <h3>{role}</h3>
                <p>리서치 방법론, 직무 이해, 커리어 준비 과정을 멘토링합니다.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionTight">
        <div className="container">
          <div className="ctaBand">
            <div>
              <h2>HYFE Alumni와 함께 성장하는 커리어</h2>
              <p>학회 활동은 리서치 결과물과 사람의 네트워크로 이어집니다.</p>
            </div>
            <Link className="button secondary" href="/recruiting">
              멘토링 프로그램 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
