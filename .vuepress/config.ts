import {defineUserConfig} from "vuepress";
import {defaultTheme} from '@vuepress/theme-default';
import { searchPlugin } from '@vuepress/plugin-search'
import navbar from "./navbarConfig";
import sidebar from "./sidebarConfig";

// import { commentPlugin } from "vuepress-plugin-comment2";

export default defineUserConfig({
    base: "/docs/",
    title: "czx的笔记",
    description: "爱看不看不看拉倒",
    lang: 'zh-CN',
    head: [
        ['link', {rel: 'icon', href: 'https://czxcab.cn/file/myblog/me.jpg'}],
        ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}]
    ],
    plugins: [
        // commentPlugin({
        //     provider: "Giscus", // Artalk | Giscus | Waline | Twikoo
        // }),
        searchPlugin({
            maxSuggestions: 10,
            locales: {
                '/': {
                    placeholder: '全局搜索',
                },
            },
        }),
    ],
    // 主题配置
    theme: defaultTheme({
        navbar: navbar,
        sidebar: sidebar,
        // logo: "/logo.png",
        lastUpdatedText: "最近更新",
    }),
});
