export default [
    {
        text: '首页',
        link: '/',
    },
    {
        text: '技术文档',
        children: [
            {
                text: '常用工具',
                children: [
                    '/docs/technicalDocument/常用工具/Stream流式编程.md',
                    '/docs/technicalDocument/常用工具/IDEA常用技巧.md',
                    '/docs/technicalDocument/常用工具/log日志快速定位.md',
                    '/docs/technicalDocument/常用工具/linux常用命令.md',
                    '/docs/technicalDocument/常用工具/常用工具网站.md',
                ],
            },
            {
                text: '部署相关',
                children: [
                    '/docs/technicalDocument/部署相关/frp内网穿透.md',
                    '/docs/technicalDocument/部署相关/minio安装使用.md',
                ],
            },
        ]
    },
    {
        text: '知识碎片',
        link: '/docs/knowledgeShard/',
    },
    {
        text: '留言板',
        link: 'https://czxcab.cn/message',
    },
    {
        text: 'GitHub',
        link: 'https://github.com/Chenzhexian',
    },
];
