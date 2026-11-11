import Link from "next/link";
import type { CSSProperties } from "react";
import { BoardList } from "@/components/boards/BoardList";
import { banners, homeStats, whatWeDo } from "@/lib/content/site-content";
import { listPosts } from "@/lib/db/post-repository";

export default async function HomePage() {
  const posts = (await listPosts("PUBLIC_REPORT")).slice(0, 4);

  return (
    <main>
      <section className="hero" style={{ "--banner": `url(${banners.home})`, "--banner-position": "center" } as CSSProperties}>
        <div className="heroInner">
          <h1>
            HYFE
            <span>Hanyang Financial Engineering</span>
          </h1>
          <p className="heroLead">금융공학과 투자 리서치를 연결하는 한양대학교 학회</p>
          <div className="heroActions">
            <Link className="button" href="/about">
              학회 소개
            </Link>
            <Link className="button ghost" href="/recruiting">
              리크루팅 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeader center">
            <span className="eyebrow">HYFE at a Glance</span>
            <h2>리서치와 네트워크를 함께 축적합니다</h2>
          </div>
          <div className="statsGrid three">
            {homeStats.map((item) => (
              <article className="statCard" key={item.label}>
                <span className="statIcon">{item.icon}</span>
                <div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionSoft">
        <div className="container">
          <div className="sectionHeader">
            <h2>What We Do</h2>
            <p className="sectionLead">금융 지식과 실무 경험을 쌓고, 함께 성장하는 학회입니다.</p>
          </div>
          <div className="featureGrid">
            {whatWeDo.map((item) => (
              <article className="featureCard" key={item.title}>
                <span className="miniIcon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container boardShell">
          <div className="sectionHeader">
            <h2>Latest Reports</h2>
            <p className="sectionLead">HYFE 학회원이 작성한 최신 공개 리서치 자료입니다.</p>
          </div>
          <BoardList posts={posts} basePath="/reports" />
          <div className="actionRow">
            <Link className="button secondary" href="/reports">
              전체 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="sectionTight">
        <div className="container">
          <div className="ctaBand">
            <div>
              <h2>2026 상반기 리크루팅</h2>
              <p>금융과 투자를 함께 공부하며 성장할 새 학회원을 기다립니다.</p>
            </div>
            <Link className="button secondary" href="/recruiting">
              모집 안내 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
