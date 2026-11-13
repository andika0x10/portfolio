import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import { ErrorPage } from "./components/ErrorPage";
import { CustomCursor } from "./components/CustomCursor";
import { getHomeMetadata, getErrorMetadata } from "./lib/seo";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = ({ error }) => [
  ...(error != null
    ? getErrorMetadata(isRouteErrorResponse(error) ? error.status : 500)
    : getHomeMetadata()),
  { name: "theme-color", content: "#ffffff" },
  { name: "format-detection", content: "telephone=no" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <CustomCursor />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let code = "Error";
  let details = "Something went wrong. Please try again or return to the home page.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    code = String(error.status);
    details = error.status === 404 ? "This page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return <ErrorPage key={`${code}:${details}`} code={code} details={details} stack={stack} />;
}
