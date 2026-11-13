import { EditorialText } from "./EditorialText";
import { useEditorialMotion } from "../hooks/useEditorialMotion";

export function ErrorPage({ code, details, stack }: { code: string; details: string; stack?: string }) {
  const ref = useEditorialMotion<HTMLDivElement>(true);
  return (
    <main className="error-page">
      <div ref={ref} className="section-shell error-page__inner">
        <h1 className="error-page__code" aria-label={code === "404" ? "404 — Page not found" : code}>
          <EditorialText text={code} />
        </h1>
        <p className="error-page__message">
          <EditorialText text={details} />
        </p>
        <a className="text-link error-page__home" href="/" data-reveal-simple>
          Back to home <span aria-hidden="true">↖</span>
        </a>
        {stack && (
          <details className="error-page__debug">
            <summary>Error details</summary>
            <pre>
              <code>{stack}</code>
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
