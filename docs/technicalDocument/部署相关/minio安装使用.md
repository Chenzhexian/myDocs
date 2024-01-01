---
title: minio安装使用
date: 2023-12-19
---
## 前言
MinIO 是一个高性能的对象存储服务器，用于构建云存储解决方案。它使用Golang编写，专为私有云、公有云和混合云环境设计。它是兼容Amazon S3 API的，并可以作为一个独立的存储后端或与其他流行的开源解决方案（如Kubernetes）集成。

>何为对象存储？ 对象存储服务（ Object Storage Service，OSS ）是一种海量、安全、低成本、高可靠的云存储服务，适合存放任意类型的文件。容量和处理能力弹性扩展，多种存储类型供选择，全面优化存储成本。

## 安装

官网地址: [https://min.io/download#/linux](https://min.io/download#/linux)

可以看到官网已经把要执行的命令写的很详细了，可以使用wget下载minio，可以下载好上传到自己的服务器
![](https://czxcab.cn/file/docs/minio1.jpg)

### 1. 进到/usr/local 目录（也可以自己设置路径，但路径最好不要有中文）
```shell
cd /usr/local
```

### 2. 在usr/local下创建minio文件夹，并在minio文件里面创建bin和data目录，把下载好的minio文件拷贝到bin目录里面(这里是直接建了文件夹方便区分文件,其实放哪都无所谓)
```shell
mkdir minio
mkdir minio/bin
mkdir minio/data
cd minio/bin
wget https://dl.min.io/server/minio/release/linux-amd64/minio
```
### 3. 赋予它可执行权限
```shell
chmod +x minio
```

### 4. 设置账号密码
```shell
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=password
```

### 5. 启动minio
 ```shell
./minio server /usr/local/minio/data --console-address ":9001"
# --console-address 指定控制台端口,默认是9000
```
但是这样启动minio,一旦我们关闭了终端，minio也会停止运行，所以我们需要将 minio 添加成 Linux 的服务

在 `/etc/systemd/system` 新建minio.service 文件把下面配置文件写入
```shell
[Unit]
Description=Minio
Wants=network-online.target
After=network-online.target
AssertFileIsExecutable=/usr/local/minio/bin/minio

[Service]
WorkingDirectory=/usr/local/minio/
PermissionsStartOnly=true
ExecStart=/usr/local/minio/bin/minio server /usr/local/minio/data
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

这样就可以使用 systemctl 启停 minio
```shell
systemctl start minio   # 启动
systemctl stop minio    # 停止
```

成功启动后访问 [http://ip:9000]，你会看到类似如下界面

![](https://czxcab.cn/file/docs/minio2.jpg)

## 使用
### 1. 创建桶

登录后我们选择左边菜单栏的`Bucket`，点击创建bucket,点击右上角`Create Bucket`

![](https://czxcab.cn/file/docs/minio3.jpg)

输入桶名，点击`Create Bucket`,创建成功后，我们就可以看到创建好的桶了

![](https://czxcab.cn/file/docs/minio4.jpg)
![](https://czxcab.cn/file/docs/minio5.jpg)

### 2. 上传文件

选择左边菜单栏的Object Broswer，然后选择刚刚创建好的桶，点击`Upload`可以上传文件,点击Create new path可以创建文件路径

![](https://czxcab.cn/file/docs/minio6.jpg)

上传文件后我们想通过路径就能访问到文件，需要怎么设置呢？

其实很简单，我们选择`Bucket`,然后选择我们的桶,然后点击`Anoymous`,然后点击`Add Access Rule`,配置一个星号只读权限，这样我们就能通过路径访问到文件了
![](https://czxcab.cn/file/docs/minio7.jpg)


以下面这个为例子,我有个叫`file`的桶,文件路径为/file/docs/minio1.jpg,那我们只需要访问 `http://localhost:9000/file/docs/minio1.jpg` 就能访问到文件了
![](https://czxcab.cn/file/docs/minio8.jpg)

## 代码集成
### 1. 引入依赖
```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.3.9</version>
</dependency>
```

### 2. 配置文件
```yaml
# minio
minio:
endpoint: http://10.0.8.3:9000
accessKey: accessKey
secretKey: secretKey
```
这里的accessKey和secretKey获取方式如下:

![](https://czxcab.cn/file/docs/minio9.jpg)

### 3. 配置类
```java
import io.minio.MinioClient;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Data
@Component
public class MinIoClientConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.accessKey}")
    private String accessKey;

    @Value("${minio.secretKey}")
    private String secretKey;

    /**
     * 注入minio 客户端
     *
     * @return
     */
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

}
```
### 4. 工具类
```java
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.extra.spring.SpringUtil;
import io.minio.*;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @description： minio工具类
 * @version：3.0
 */

@Component
@Slf4j
public class MinioUtil {
    private static final MinioClient minioClient = SpringUtil.getBean(MinioClient.class);


    /**
     * description: 判断bucket是否存在，不存在则创建
     *
     * @return: void
     */
    public static void existBucket(String name) throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(name).build());
        if (!exists) {
            throw new RuntimeException("该bucket不存在");
        }

    }

    /**
     * 创建存储bucket
     *
     * @param bucketName 存储bucket名称
     * @return Boolean
     */
    public static Boolean makeBucket(String bucketName) {
        try {
            minioClient.makeBucket(MakeBucketArgs.builder()
                    .bucket(bucketName)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    /**
     * 删除存储bucket
     *
     * @param bucketName 存储bucket名称
     * @return Boolean
     */
    public static Boolean removeBucket(String bucketName) {
        try {
            minioClient.removeBucket(RemoveBucketArgs.builder()
                    .bucket(bucketName)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    /**
     * description: 上传文件
     *
     * @param multipartFile
     * @return: java.lang.String
     */
    public static List<String> upload(MultipartFile[] multipartFile, String filePath, String bucketName) throws Exception {
        existBucket(bucketName);
        List<String> names = new ArrayList<>(multipartFile.length);
        for (MultipartFile file : multipartFile) {
            String fileName = upload(file, filePath, bucketName);
            names.add(fileName);
        }
        return names;
    }


    public static String upload(MultipartFile file, String filePath, String bucketName) {
        if (ObjectUtil.isEmpty(file)) {
            throw new RuntimeException("上传文件不能为空");
        }
        String originalFilename = file.getOriginalFilename();
        assert originalFilename != null;
        String suffix = originalFilename.substring(originalFilename.indexOf(".") + 1);
        String prefix = String.format("%s/%s_%s", filePath, originalFilename.substring(0, originalFilename.indexOf(".")), System.currentTimeMillis());

        String fileName = String.format("%s.%s", prefix, suffix);
        InputStream in = null;
        try {
            in = file.getInputStream();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(in, in.available(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
        } catch (Exception e) {
            log.error("minio上传文件报错:{}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    log.error("minio上传关闭报错:{}", e.getMessage());
                }
            }
        }
        return fileName;
    }

    /**
     * description: 上传文件流
     *
     * @param in
     * @return: InputStream
     */
    public static void upload(InputStream in, String bucketName, String fileName) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .stream(in, in.available(), -1)
                    .contentType("application/octet-stream;charset=UTF-8")
                    .build()
            );
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                in.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * 批量删除文件对象
     *
     * @param bucketName 存储bucket名称
     * @param objects    对象名称集合
     */
    public static Iterable<Result<DeleteError>> removeObjects(String bucketName, List<String> objects) {
        List<DeleteObject> dos = objects.stream().map(e -> new DeleteObject(e)).collect(Collectors.toList());
        Iterable<Result<DeleteError>> results = minioClient.removeObjects(RemoveObjectsArgs
                .builder().bucket(bucketName).objects(dos).build());
        return results;
    }


}
```
