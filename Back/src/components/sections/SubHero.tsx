import type { CSSProperties } from "react";

type SubHeroProps = {
  title: string;
  subtitle?: string;
  image: string;
  current: string;
  parent?: string;
  position?: string;
};

export function SubHero({ title, subtitle, image, current, parent, position = "center" }: SubHeroProps) {
  return (
    <section
      className="subHero"
      style={{ "--banner": `url(${image})`, "--banner-position": position } as CSSProperties}
    >
      <div className="subHeroInner">
        <p className="breadcrumb">
          <span>Home</span>
          <span>/</span>
          {parent ? (
            <>
              <span>{parent}</span>
              <span>/</span>
            </>
          ) : null}
          <span>{current}</span>
        </p>
        <h1>{title}</h1>
        {subtitle ? <p className="subHeroLead">{subtitle}</p> : null}
      </div>
    </section>
  );
}
