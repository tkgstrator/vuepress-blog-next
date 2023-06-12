import { defineUserConfig } from 'vuepress'
import { comment, hopeTheme } from "vuepress-theme-hope";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { searchPlugin } from "@vuepress/plugin-search";
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: "en-US",
  title: "えいむーと愉快な仲間たち",
  description: "洗ってないワンチャンの臭いがします",
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap",
      },
    ],
  ],
  plugins: [
    searchPlugin({
      maxSuggestions: 10,
    }),
  ],
  theme: hopeTheme({
    plugins: {
      comment: {
        provider: "Giscus",
        repo: "tkgstrator/vuepress-blog-next",
        repoId: "R_kgDOJuLbqA",
        category: "Announcements",
        categoryId: "DIC_kwDOJuLbqM4CXI-M",
        lazyLoading: true,
        reactionsEnabled: true,
        delay: 1,
      },
    },
  }),
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
});