---
title: linux常用命令
date: 2023-12-19
---

# linux常用命令
***
### 打包压缩

将文件夹`mydata`,打包压缩并保留原文件,生成新的文件`backup.tar.gz`

```shell
tar -cvzf backup.tar.gz /mydata
```

具体解释：
- c: 创建一个新的压缩文件。
- v: 显示详细信息，让你能够看到压缩的过程。
- z: 使用gzip进行压缩。
- f: 指定压缩文件的名称。

### 解压

将文件`backup.tar.gz`解压到当前路径下

```shell
tar -xvzf backup.tar.gz
```
具体解释：
- x: 解压文件。
- v: 显示详细信息，以便查看解压过程。
- z: 使用gzip进行解压。
- f: 指定要解压的文件。

### 查看java进程

```shell
ps -ef |grep java
```
具体解释：
- `-ef`: 显示所有进程。
- `|grep` 后面可以换成其他关键字

### 停止进程

使用`ps`命令后可以看到进程的`pid`,可以通过`pid`关闭进程

```shell
#例如pid为1234
kill 1234
kill -9 1234
```
具体解释：
- `-9`: 表示强制终止，如果常规的`kill`命令无法正常停止进程时可以使用 。

### 内存使用分析

```shell
free -h
```

具体解释：
- `-h`: 会将字节（Bytes）转换为更大的单位，例如千字节（KB）、兆字节（MB）、千兆字节（GB）等，以避免在显示大量数据时导致混淆。

当你执行`free -h`命令时，它会显示系统的内存使用情况，`-h`表示以人类可读的方式。以下是 free -h 输出的示例：

```text
            total        used        free      shared  buff/cache   available
Mem:         7.7G        3.2G        489M        788K        4.0G        4.1G
Swap:        2.0G         32M        1.9G
```

让我们逐一解释每一列的含义：

1. `total`： 总内存，表示系统上物理内存的总量。在示例中，总内存为 7.7 GB。

2. `used`： 已使用的内存，表示系统当前正在使用的物理内存。在示例中，已使用的内存为 3.2 GB。

3. `free`： 空闲内存，表示系统当前未被使用的物理内存。在示例中，空闲内存为 489 MB。

4. `shared`： 共享内存，表示被多个进程共享的内存。在示例中，共享内存为 788 KB。

5. `buff/cache`： 缓存和缓冲区内存，表示系统用于缓存文件系统和其它 I/O 操作的内存。在示例中，缓存和缓冲区内存为 4.0 GB。

6. `available`： 可用内存，表示系统中仍然可用于分配给新进程的内存。在示例中，可用内存为 4.1 GB。

7. `Swap`： 交换空间，表示系统用于交换数据的磁盘空间。Swap是一种虚拟内存，当物理内存不足时，系统会将一些不常用的数据写入交换空间。在示例中，总交换空间为 2.0 GB，已使用 32 MB，剩余 1.9 GB。

还可以使用`top`实时查看系统性能统计和当前运行进程信息：
```shell
top
```

### 查看端口使用情况

1. 使用`netstat`命令：
`netstat`命令可以显示网络连接、路由表、接口状态等信息。以下是一些示例：

- 查看所有端口的使用情况：
```shell
netstat -tulpn
```
这将显示所有TCP和UDP端口的使用情况，以及占用这些端口的进程信息。

- 查看指定端口的使用情况（例如，查看80端口）：
```shell
netstat -tulpn | grep :80
```

2. 使用`ss`命令：
`ss`是另一个用于查看套接字统计信息的命令，它比`netstat`更快速且效率更高。以下是一些示例：

- 查看所有端口的使用情况：
```shell
ss -tulpn
```

- 查看指定端口的使用情况（例如，查看80端口）：
```shell
ss -tulpn | grep :80
```

3. 使用`lsof`命令：
`lsof`命令用于列出打开文件的信息，也可以用于查看端口的使用情况。以下是一些示例：

- 查看所有端口的使用情况：
```shell
lsof -i
```

- 查看指定端口的使用情况（例如，查看80端口）：
```shell
lsof -i :80
```

### 防火墙配置

配置`iptables`防火墙涉及到定义规则，这些规则用于控制网络流量。以下是一些基本的步骤和示例，可以帮助你配置 iptables：

1. 查看当前规则：
```shell
sudo iptables -L
```

这会列出当前防火墙规则。

2. 清空规则（可选）：
如果你之前已经设置了一些规则并希望清空它们，可以使用以下命令：
```shell
sudo iptables -F
```

3. 设置默认策略：
```shell
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
```

这将设置默认的策略为允许所有流量。你可以根据需要更改默认策略。

4. 允许本地回环：
```shell
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT
```

这样可以允许本地回环，确保本地进程可以通过localhost进行通信。

5. 允许已建立的连接和相关的流量：
```shell
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```

这样可以允许已经建立的连接和相关的流量。

6. 允许SSH连接：
```shell
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```

这会允许SSH连接，确保你不会被锁定在SSH之外。

7. 允许其他需要的服务端口（根据你的需求）：
```shell
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # 允许HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT # 允许HTTPS
```

根据你的服务和需求，允许其他必要的端口。

8. 拒绝其余流量：
```shell
sudo iptables -A INPUT -j DROP
sudo iptables -A FORWARD -j DROP
sudo iptables -A OUTPUT -j DROP
```

这样会拒绝所有未匹配规则的流量。

9. 保存规则：

在很多系统中，iptables规则不会在重启后保留。你可以使用以下命令保存规则：
```shell
sudo service iptables save
```

或者，具体取决于你的发行版，你可能需要使用不同的命令来保存规则。

### chmod修改权限的用法

1. 语法：chmod [对谁操作] [操作符] [赋予的权限] 文件名

2. 操作对象：
- `u` 用户user，表现文件或目录的所有者
- `g` 用户组group，表现文件或目录所属的用户组
- `o` 其他用户other
- `a` 所有用户all

3. 操作符：
- `+` 添加权限       
- `-` 减少权限         
- `=` 直接给定一个权限

4. 权限：
- `r` 读权限      
- `w` 写权限
- `x` 执行权限

#### 实例
将文件 file1.txt 设为所有人皆可读取 :
```shell
chmod ugo+r file1.txt
```

将文件 file1.txt 设为所有人皆可读取 :
```shell
chmod a+r file1.txt
```

#### 另一种写法
```shell
chmod 765 file1.txt
```
765 将这样解释：
- 所有者的权限用数字表达：属主的那三个权限位的数字加起来的总和。如 rwx ，也就是 4+2+1 ，应该是 7。
- 用户组的权限用数字表达：属组的那个权限位数字的相加的总和。如 rw- ，也就是 4+2+0 ，应该是 6。
- 其它用户的权限数字表达：其它用户权限位的数字相加的总和。如 r-x ，也就是 4+0+1 ，应该是 5。

