---
title: log日志快速定位
date: 2022-05-29
---

动态查看日志
```shell
tail -f catalina.ou
```

从头打开日志文件
```shell
cat catalina.ou
```

可以使用 >nanjiangtest.txt 输出某个新日志去查看
```shell
cat -n catalina.out |grep 717892466 >nanjiangtest.txt
```

> 记录一下工作时突发情况，一台服务器的数据库被误删了数据，这个数据库每天都有全量备份，于是用到了下面的方法
>```shell
>#从全备份中提取出该表的建表语句
>sed -e'/./{H;$!d;}' -e 'x;/CREATE TABLE `表名`/!d;q' 全备库或导出的单库.sql > 表tt.sql
>
>#提取该表的insert into语句,追加到上一个建库sql后
>grep -i 'INSERT INTO `表名`' 全备库或导出的单库.sql >>表tt.sql
>```

ail/head简单命令使用：
```shell
tail -n number catalina.out 查询日志尾部最后number行的日志
tail -n +number catalina.out 查询number行之后的所有日志
head -n number catalina.out 查询日志文件中的前number行日志
head -n -number catalina.out 查询日志文件除了最后number行的其他所有日志
```
### 方式一：根据关键字查找出行号
***
用grep拿到的日志很少，我们需要查看附近的日志。我是这样做的，首先: cat -n test.log | grep “关键词” 得到关键日志的行号

![图片](https://czxcab.cn/file/docs/log1.jpg)

`cat -n xxx.log|tail -n +46756|head -n 10`

`tail -n +46756`表示查询46756行之后的日志

`head -n 10`则表示在前面的查询结果里再查前10条记录

也就是查询从46756行开始的后10行
![图片](https://czxcab.cn/file/docs/log2.jpg)

那么如果要查前10行怎么办?

`cat -n xxx.log|head -n 46756|tail -n 10`

`head -n 10`表示查询结果里查前46756条记录

`tail -n 10`则表示在前面的查询结果里再查后10条记录

![图片](https://czxcab.cn/file/docs/log3.jpg)

###  方式二：查看指定时间段内的日志
***
首先要进行范围时间段内日志查询先查看是否在当前日之内存在
```shell
grep '11:07 18:29:20' xxx.log
grep '11:07 18:31:11' xxx.log
```

时间范围内的查询
```shell
sed -n '/11:07 18:29:20/,/11:07 18:31:11/p' xxx.log
sed -n '/11:07 18:29:/,/11:07 18:31:/p' xxx.log
```

###  方式三：查看日志中特定字符的匹配数目
***
```shell
grep '1175109632' xxx.log | wc -l 

154
```

###  方式四：查询最后number行，并查找关键字
***
```shell
[root@yesky logs]# tail -n 5 xxx.log | grep 'INFO Takes:1'
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [MTE5MDMw] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [NTQ2MzQw] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [NTg2NzYy] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [MzYyMjA=] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.configModule.impl.ConfigModuleDaoImpl getPersonMenuList
```

### 方式五：查询最后number行，并查找关键字“结果”并且对结果进行标红，上下扩展两行
***
```shell
[root@yesky logs]# tail -n 5 xxx.log | grep 'INFO Takes:1' --color -a2
[11:11 22:02:51] INFO Takes:0 ms class com.tmg.cms.manager.dao.article.impl.ArticleContentDaoImpl getArticlePageNum [NzE4MTM2ODky] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.config.impl.ConfigInfoDaoImpl load [com.tmg.cms.manager.model.config.ConfigInfo]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [NTkwOTQ5] [int]
[11:11 22:02:51] INFO Takes:1 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [MzI0] [int]
[11:11 22:02:51] INFO Takes:0 ms class com.tmg.cms.manager.dao.sitemap.impl.SitemapDaoImpl getSitemapTop [MzI1] [int]
```

### 附加
***
1. 全屏导航

- ctrl + F - 向前移动一屏
- ctrl + B - 向后移动一屏
- ctrl + D - 向前移动半屏
- ctrl + U - 向后移动半屏

2. 单行导航

- j - 向前移动一行
- k - 向后移动一行

3. 其它导航

- G - 移动到最后一行
- g - 移动到第一行
- q / ZZ - 退出 less 命令
