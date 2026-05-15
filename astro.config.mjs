import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://webstock.example.com",
  output: "static",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
