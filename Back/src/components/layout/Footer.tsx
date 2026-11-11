import Link from "next/link";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerInner">
        <div className="footerGrid">
          <div className="footerLogo">
            <strong>HYFE</strong>
            <span>한양대학교 금융공학회</span>
          </div>
          <p className="footerIntro">
            HYFE는 금융공학과 투자 리서치를 기반으로 시장을 분석하고, 실전적인 인사이트를 만들어가는 한양대학교 학회입니다.
          </p>
          <div>
            <p className="footerTitle">CONTACT</p>
            <ul className="footerList">
              <li>hyfe.official@example.com</li>
              <li>Hanyang University</li>
            </ul>
          </div>
          <div>
            <p className="footerTitle">QUICK LINKS</p>
            <ul className="footerList">
              <li>
                <Link href="/about">ABOUT</Link>
              </li>
              <li>
                <Link href="/reports">REPORTS</Link>
              </li>
              <li>
                <Link href="/recruiting">RECRUITING</Link>
              </li>
              <li>
                <Link href="/member">MEMBER</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footerBottom">Copyright © HYFE. All rights reserved.</div>
      </div>
    </footer>
  );
}
