import { EditorialText, SectionLabel } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

const ACTIVITIES = [
  {
    period: "Jul 2025",
    title: "PesawaranCTF",
    result: "3rd",
    meta: "Team: RPLXploit",
    body: "I competed with RPLXploit and placed 3rd at PesawaranCTF, a Capture The Flag competition focused on cybersecurity problem solving, speed, and strategy.",
    href: "https://lampungcorner.com/adu-strategi-dan-kecepatan-ctf-2025-pesawaran-cetak-talenta-muda-keamanan-siber/",
  },
];

export function ActivitiesSection() {
  const ref = useEditorialMotion();
  return (
    <section id="activities" ref={ref} className="section-shell activities" aria-labelledby="activities-title">
      <SectionLabel id="activities-title">Activities</SectionLabel>
      <div className="entry-list" data-focus-group>
        {ACTIVITIES.map((item) => (
          <article key={item.title} data-focus-item>
            <p className="activities__context section-meta" data-reveal-simple>Capture the flag / {item.period}</p>
            <p className="activities__result"><EditorialText text={`${item.result} place`} /></p>
            <h3 className="entry-title"><EditorialText text={item.title} /></h3>
            <p className="activities__team"><EditorialText text={item.meta} /></p>
            <p className="activities__description section-copy"><EditorialText text={item.body} /></p>
            <a className="text-link activities__link" href={item.href} target="_blank" rel="noopener noreferrer" data-reveal-simple>Read the article</a>
          </article>
        ))}
      </div>
    </section>
  );
}
