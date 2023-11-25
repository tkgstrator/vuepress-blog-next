import { defineUserConfig } from "vuepress";
import { blog, hopeTheme, mdEnhance, pwa } from "vuepress-theme-hope";
import { searchPlugin } from "@vuepress/plugin-search";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  lang: "en-US",
  title: "えいむーと愉快な仲間たち",
  description: "洗ってないワンちゃんの臭いがします",
  port: 3000,
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP&display=swap",
      },
    ],
  ],
  shouldPrefetch: true,
  plugins: [
    searchPlugin({
      maxSuggestions: 20,
    }),
  ],
  theme: hopeTheme({
    encrypt: {
      global: false,
    },
    fullscreen: true,
    pure: true,
    darkmode: "switch",
    navbarAutoHide: "mobile",
    hotReload: true,
    headerDepth: 2,
    breadcrumb: true,
    toc: false,
    displayFooter: true,
    sidebar: "heading",
    copyright: "Copyright Magi Corporation. All rights reserved.",
    lastUpdated: true,
    editLink: true,
    hostname: "https://tkgstrator.work",
    author: "tkgling",
    plugins: {
      copyCode: {
        showInMobile: false,
      },
      feed: {
        json: true,
      },
      seo: true,
      pwa: false,
      blog: {
        article: "/article",
        category: "/category",
      },
      mdEnhance: {
        mathjax: true,
        mermaid: true
      },
      comment: {
        provider: "Giscus",
        repo: "tkgstrator/vuepress-blog-next",
        repoId: "R_kgDOJuLbqA",
        category: "Announcements",
        categoryId: "DIC_kwDOJuLbqM4CXI-M",
        lazyLoading: true,
        reactionsEnabled: false,
        delay: 0,
      },
    },
    blog: {
      sidebarDisplay: "none",
      articlePerPage: 10,
      avatar: "/ico_ep2_01.webp",
      name: "えいむーと愉快な仲間たち",
      description: "最近どうもやる気がでません",
      roundAvatar: true,
      medias: {
        GitHub: "https://github.com/tkgstrator",
        Twitter: "https://twitter.com/herlingum",
        Gmail: "nasawake.am@gmail.com",
        Discord: "https://discordapp.com/users/430364540899819520",
      },
    },
  }),
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
});
