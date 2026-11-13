import type { Config } from "@react-router/dev/config";

export default {
  // Render the portfolio in the Workers runtime, then hydrate its animations.
  ssr: true,
} satisfies Config;
