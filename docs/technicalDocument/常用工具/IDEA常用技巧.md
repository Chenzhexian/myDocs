---
title: IDEA常用技巧
date: 2022-08-29
---

:::warning 注意：不同idea版本菜单、目录可能有细微差别，自己稍加分析都能找到
:::

### 1.查看代码历史版本
鼠标在需要查看的java类 右键 找到`Local History` >> `Show History` 点开即可看到历史版本，常用于自己忘记代码改了哪些内容 或需要恢复至某个版本 (注意 只能看近期修改 太久了也是看不到的)

![图片](https://czxcab.cn/file/docs/idea1.jpg)

### 2.调整idea的虚拟内存
尽管本质都是去改变 .vmoptions配置文件，但推荐使用`Change Memory Settings`去调整，选择`Edit Custom VM Options` 或者在本地磁盘目录更改，通过某些方法破解的idea 很可能造成idea打不开的情况。

![图片](https://czxcab.cn/file/docs/idea2.jpg)

### 3.设置提示词忽略大小写
把这个勾去掉，（有的idea版本是选择选项 选择none即可），例如String 输入string 、String 都可以提示

![图片](https://czxcab.cn/file/docs/idea3.jpg)

### 4.关闭代码检查
与eclipse类似，idea也可以自己关闭代码检查 减少资源使用，但不推荐全部关闭，（是大佬当我没说），把我们项目中不会使用到的关闭就好了

![图片](https://czxcab.cn/file/docs/idea4.jpg)

### 5.设置文档注释模板
文档注释快捷键及模板

[参考链接](https://blog.csdn.net/qq_36268103/article/details/108027486)

### 6.显示方法分隔符
方便查看方法与方法之间的间隔，在代码不规范的项目中 很好用！

![图片](https://czxcab.cn/file/docs/idea5.jpg)

### 7.设置多行tab
idea默认是选择显示单行的，我们把这个去掉，就可以显示多行tab了，在打开tab过多时的场景非常方便！

![图片](https://czxcab.cn/file/docs/idea6.jpg)
>tab过多会自动关闭，`settings` - `editor` - `General` - `Editor tabs` - `tab limit` 数值设大就好了

### 8.快速匹配方法的大括号位置
`ctrl+[` 和 `ctrl+]` 可以快速跳转到方法大括号的起止位置，配合方法分隔符使用，不怕找不到方法在哪儿分割了。

### 9.代码结尾补全
例如一行代码补全分号，或者是if(xxx) 补全大括号，按`ctrl+shift+enter` 无需切换鼠标光标，大幅度提升了编码效率。

### 10.模糊搜索方法
例如People类里面的test方法，按`ctrl+shift+alt+n` 输入`Peo.te` 就可以查到该方法了，如果觉得这个快捷键难记 也可以按`ctrl+shift+f` （全局搜索文件）

### 11.预览某个类的代码
例如People类里面的test方法，按`ctrl+shift+a`

例如我们在test类中，有句代码：People p = new People(); 我们想稍微查看一下People这个类，但是tab已经够多了，`ctrl+alt+b`会打开新的标签，标签多了就混乱了，尤其一堆命名类似的tab,这时候我们可以按`ctrl+shift+i` 实现预览功能，不占tab

![图片](https://czxcab.cn/file/docs/idea7.jpg)

### 12.查看方法在哪里被调用
`ctrl+alt+h` 可以清楚看到方法在哪些地方被调用；在知道这个快捷键之前，都是ctrl+h（idea默认 ctrl+shift+f）搜索，肉眼找的…

![图片](https://czxcab.cn/file/docs/idea8.jpg)

### 13.自动导包、自动移除没用的包
>手动导包: `alt+enter` 
>手动移除未使用包: `crtl+alt+o`

![图片](https://czxcab.cn/file/docs/idea9.jpg)

### 14.括号颜色区分
`Rainbow Brackets` 插件 成对的括号用相同的颜色表示出来了

![图片](https://czxcab.cn/file/docs/idea10.jpg)

### 15.idea全局设置（打开新窗口设置）
例如我们打开新窗口时，maven配置会恢复 这时就需要对打开新窗口的设置进行修改 达到一个全局的目的。

![图片](https://czxcab.cn/file/docs/idea11.jpg)

### 16.快捷键切换回上一个点开的tab
当我们打开了多个tab的时候 ， 想要快速回到上一个点击的tab中 有的时候肉眼很难找

我们可以用快捷键 `alt + ←` 键 (eclipse版快捷键 idea默认快捷键需要自测) ，有的时候我们在后面tab编辑了内容 按一次可能不够 需要再多按几次 ,相应的 `alt + →` 切换到下一个点击的tab
>常见应用场景：debug发生类跳转时 、利用快捷键在其它类中创建方法时

### 17.idea同个项目不同端口多开
这是个非常实用的功能，可以模拟集群 测试负载均衡。

此外 在开发阶段也是非常好用，开发过程中，让别人直接连自己本地测试 是不是非常方便？

那自己又想打断点调试 会影响别人 怎么办呢 ？这个时候多开的作用就体现出来了！

网上很多方法提到勾选 `Allow parallel run` (不同版本idea 名称不一样) ，我也亲眼见过有老师是可以多开启动的， 但我本地启动发现每次都会同时同端口启动多个，不知道是版本问题还是操作问题，这里我用的是另一种有效的方法：

在 `VM options` 加上
```java
8993是区别于 application.yml 配置中 port 的另一个端口，达到不同端口多开的效果
-Dserver.port=8993
```

