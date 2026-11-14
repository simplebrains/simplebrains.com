import { defineConfig } from "astro/config";
import { oqxShikiLanguage } from "@omgbase/oqx-syntax/shiki";

export default defineConfig({
  site: "https://simplebrains.com",
  output: "static",
  markdown: {
    shikiConfig: {
      langs: [oqxShikiLanguage],
      // Dark blocks against the light teal/coral chrome.
      theme: "github-dark",
    },
  },
});
