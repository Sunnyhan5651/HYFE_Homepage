import Image from "next/image";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { aboutTabs, banners, coreActivities, principles, withActive } from "@/lib/content/site-content";

export default function AboutPage() {
  return (
    <main>
      <SubHero
        title="ABOUT HYFE"
        subtitle="정량적 사고와 기업 분석을 바탕으로 금융시장을 연구합니다."
        image={banners.about}
        parent="About"
        current="HYFE 소개"
      />
      <SubNavigation section="ABOUT" links={withActive(aboutTabs, "/about")} />

      <section className="section">
        <div className="container split">
          <div className="sectionHeader">
            <span className="eyebrow">ABOUT</span>
            <h2>한양대학교 금융공학회 HYFE</h2>
            <p className="sectionLead">
              HYFE는 기업 분석, 퀀트 리서치, 포트폴리오 전략을 함께 학습하며 금융시장을 체계적으로 해석하는 학회입니다.
            </p>
            <p className="copy">We connect financial engineering with disciplined investment research.</p>
          </div>
          <div className="imagePanel">
            <Image src={banners.about} alt="HYFE 세미나 이미지" width={960} height={520} priority />
          </div>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>우리가 지향하는 가치</h2>
          </div>
          <div className="statsGrid three">
            {principles.map((item) => (
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

      <section className="section">
        <div className="container">
          <div className="sectionHeader center">
            <h2>숫자로 보는 HYFE</h2>
          </div>
          <div className="statsGrid">
            {[
              ["Founded", "2011", "학회 설립"],
              ["Members", "120+", "활동 및 알럼나이"],
              ["Reports", "120+", "누적 리서치"],
              ["Sessions", "80+", "정규 세션"],
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
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>Core Activities</h2>
            <p className="sectionLead">정규 세션과 팀 프로젝트를 통해 리서치 결과물을 축적합니다.</p>
          </div>
          <div className="featureGrid">
            {coreActivities.map((item) => (
              <article className="infoCard" key={item.title}>
                <span className="miniIcon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
