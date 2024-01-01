---
title: frp内网穿透
date: 2023-12-19
---

## frp概述
>frp 是一个高性能的反向代理应用，可以帮助您轻松地进行内网穿透，对外网提供服务，支持 tcp, http, https 等协议类型，并且 web 服务支持根据域名进行路由转发。frp 采用 C/S 模式，将服务端部署在具有公网 IP 机器上，客户端部署在内网或防火墙内的机器上，通过访问暴露在服务器上的端口，反向代理到处于内网的服务。 在此基础上，frp 支持 TCP, UDP, HTTP, HTTPS 等多种协议，提供了加密、压缩，身份认证，代理限速，负载均衡等众多能力。

frp官网：https://gofrp.org/

GitHub地址：https://github.com/fatedier/frp

## 下载frp

>由于frp是go语言开发，因此可以直接下载可执行程序，没有任何依赖。一般通过GitHub的releases下载：https://github.com/fatedier/frp/releases

可以选择linux版本和windows版本

![图片](https://czxcab.cn/file/docs/frp1.jpg)

## frp安装
### 服务器端(接口请求的)

:::tip 首先你得有个拥有公网ip的服务器，这里我使用的是云服务器
:::

1. 首先把下载的压缩包上传到云服务器上

![图片](https://czxcab.cn/file/docs/frp2.jpg)

2. 修改文件权限

>不修改文件权限会包错，我这里图方便，所以直接全部设置成777了

```
chmod 777 /mydata/frp/frps
chmod 777 /mydata/frp/frps.ini
```
3. 修改配置文件frps.ini

```properties
[common]
# 这个默认端口是7000，就是客户端和服务端通信的，不是你转发的那个端口
# 如果这个要改了，客户端的7000也要改成和这里一样。
bind_port = 6660

# 这个是frp的web管理控制台的用户名密码和登录端口
dashboard_user = admin
dashboard_pwd = admin
dashboard_port = 6661

# 这个token之后在客户端会用到，相当于客户端登录服务器端，毕竟这个东西不能随便给人用，自己随便输入一串字符串就行
token = wertyoqazxcvbnjhgfcvbn

# 心跳连接：必须得有，frp 0.43.0版本如果不加，60秒就会自动断开连接！
# 服务器就加这一条，客户机每台都要加。
heartbeat_timeout = 30
```

4. 运行frpsc
```
./frps -c frps.ini
```
![图片](https://czxcab.cn/file/docs/frp3.jpg)

出现【Start frps success】代表运行成功，此时访问 x.x.x.x:7500 并使用自己设置的用户名密码登录，即可看到仪表板界面，如果不能看到，但是确实启动成功了，请去自己买的云服务器里开放端口。

![图片](https://czxcab.cn/file/docs/frp4.jpg)

:::warning 至此，我们的服务端仅运行在前台，但是Ctrl+C停止或者关闭SSH窗口后，frps 均会停止运行，所以进行如下配置
:::

配置systemctl进行开机启动

```shell
vim /lib/systemd/system/frpc.service

# 在frps.service里添加以下内容
[Unit]
Description=frps service
After=network.target syslog.target
Wants=network.target

[Service]
Type=simple
# 启动服务的命令（此处写你的frps的实际安装目录）
ExecStart=/mydata/frp/frps -c /mydata/frp/frps.ini

[Install]
WantedBy=multi-user.target
```

systemctl常用命令

```shell
#启动 
sudo systemctl start frpc  
#关闭 
sudo systemctl stop frpc 
#重启 
sudo systemctl restart frpc 
#查看状态 
sudo systemctl status frpc 
设置开机自动启动
sudo systemctl enable frpc
```
### 客户端(存储文件的)
1. 首先把下载的压缩包解压，复制到文件夹下

![图片](https://czxcab.cn/file/docs/frp5.jpg)

2. 修改配置文件frpc.ini
```shell
[common]
# 你frp服务器的公网ip地址
server_addr = 43.138.186.55
server_port = 6660
# token与frps.ini 相同
token = wertyoqazxcvbnjhgfcvbn

# 这里取名随意,一般有意义就行,一个标签指定一个端口
[minio]
# 穿透协议类型，可选：tcp，udp，http，https，stcp，xtcp，这个设置之前必须自行搞清楚应该是什么
type = tcp
# 你当前内网服务器的网卡IP地址，不要用127.0.0.1
local_ip = 0.0.0.0
# 你要转发的服务端口
local_port = 9000
# 你要映射到公网上的那个端口
remote_port = 9000
# 服务器与客户机之间的心跳连接：如果没有，每隔60秒就会自动断开连接！！！
heartbeat_timeout = 30

# 可以有多个标签
[nacos]
type = tcp
local_ip = 0.0.0.0
local_port = 8848
remote_port = 8848
heartbeat_timeout = 30
```

3. 运行frpc
```shell
frpc.exe -c frpc.ini
```

![图片](https://czxcab.cn/file/docs/frp6.jpg)

这个时候打开fpr服务器端界面就可以确认是否成功了
