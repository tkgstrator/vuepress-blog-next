import { defineUserConfig } from 'vuepress'
import { blog, hopeTheme, pwa } from "vuepress-theme-hope";
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
  shouldPrefetch: false,
  plugins: [
    searchPlugin({
      maxSuggestions: 10,
    }),
  ],
  theme: hopeTheme({
    encrypt: {},
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
    plugins: {
      copyCode: {
        showInMobile: true
      },
      feed: {
        json: true
      },
      seo: true,
      pwa: true,
      blog: {
        article: "/article",
        category: "/category",
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
      articlePerPage: 5,
      avatar: "/ico_ep2_01.png",
      name: "えいむーと愉快な仲間たち",
      roundAvatar: true,
      medias: {
        GitHub: "https://github.com/tkgstrator",
        Twitter: "https://twitter.com/tkgling",
        Gmail: "nasawake.am@gmail.com",
        Discord: "https://discordapp.com/users/430364540899819520"
      },
    }
  }),
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
});