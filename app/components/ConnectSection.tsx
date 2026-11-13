import { EditorialText, SectionLabel } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

export function ConnectSection() {
  const ref = useEditorialMotion<HTMLElement>();
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());

  return (
    <footer id="connect" ref={ref} className="section-shell connect" aria-labelledby="connect-title">
      <div className="connect__invitation">
        <SectionLabel id="connect-title">Connect</SectionLabel>
        <p className="connect__headline"><EditorialText text="Let's start a conversation." /></p>
        <a className="connect__email" href="mailto:a.introvrt@gmail.com">
          <span>a.introvrt@gmail.com</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </a>
        <nav className="connect__socials" aria-label="Profiles and blog">
          <a className="text-link" href="https://github.com/andika0x10" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="text-link" href="https://linkedin.com/in/andikadinata" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="text-link" href="https://blog.andikadinata.workers.dev/" target="_blank" rel="noopener noreferrer">Blog</a>
        </nav>
      </div>

      <div id="footer-signature" className="connect__closing">
        <p className="connect__signature-name"><EditorialText text="Andika Dinata" /></p>
        <p className="connect__signature-location">Bandar Lampung, Indonesia</p>
        <div className="connect__closing-line">
          <p className="connect__copyright">© {year} Andika Dinata</p>
          <a className="text-link connect__back" href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
