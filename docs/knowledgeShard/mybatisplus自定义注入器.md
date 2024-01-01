---
title: mybatisplus自定义注入器
date: 2023-12-19
---

# mybatisplus自定义注入器
***
## 问题与现状

工作中在进行erp相关功能的开发及其他用到sqlserver数据库的时候，使用系统框架mybatisplus的querywrapper写法生成的sql无法自动添加 with (nolock)，这可能产生锁表问题。

那如何解决这个问题，最简单的方法就是手写sql，那我们都用mybatisplus了肯定不再愿意手写那些sql语句，所以这里用到了mybatisplus提供的注入器

## 解决方法实现
:::tip 我们先讲一下怎么实现的再来解析源码
:::

### 自定义注入器

首先我们创建一个类`NolockInjector`，并让这个类继承`DefaultSqlInjector`这个类，然后我们要重写`getMethodList()`这个方法

![](https://czxcab.cn/file/docs/mp1.jpg)

result列表中添加的，比如`SelectListNolock()`就是我们自定义的方法类

### 自定义方法

创建一个类`SelectListNolock`，并继承`AbstractMethod`这个类，然后重写`injectMappedStatement()`这个方法，具体怎么写这个方法让它能生成我们想要的sql，等下面具体说明

![](https://czxcab.cn/file/docs/mp2.jpg)

### 自定义Mapper和ServiceImpl

创建一个`SqlserverNolockBaseMapper`接口和一个`SqlServerNolockServiceImpl`类，然后将上面自定义的方法写在里面

SqlserverNolockBaseMapper：

![](https://czxcab.cn/file/docs/mp3.jpg)

SqlserverNolockBaseMapper：

![](https://czxcab.cn/file/docs/mp4.jpg)

### 如何使用

平时代码中mapper都会继承`BaseMapper`接口

![](https://czxcab.cn/file/docs/mp6.jpg)

现在改为继承自定义的`SqlserverNolockBaseMapper`

![](https://czxcab.cn/file/docs/mp5.jpg)

平时代码中Service都会继承`ServiceImpl`这个类

![](https://czxcab.cn/file/docs/mp7.jpg)

现在改为继承自定义的`SqlServerNolockServiceImpl`

![](https://czxcab.cn/file/docs/mp8.jpg)

然后就能在代码中调用我们自定义的方法了

![](https://czxcab.cn/file/docs/mp9.jpg)

## 源码解析
### SQL是如何注入的？
那么SQL到底是如何注入的呢？我们先来看我们继承的SQL注入器，也是mybatisplus默认使用的注入器`DefaultSqlInjector`，查看一下它的UML图，我们能发现它的最顶层是`ISqlInjector`接口

![](https://czxcab.cn/file/docs/mp10.jpg)

进入`ISqlInjector`接口，我们可以看到一个方法`inspectInject()`，那么这个接口到底是干嘛用的呢？它只做一件事，那就是检查SQL是否注入，已经注入过则不再注入。

![](https://czxcab.cn/file/docs/mp11.jpg)

继续往下走，看下一层抽象类`AbstractSqlInjector`，一共有两个方法。一个是重写后的`inspectInject()`方法，另一个是`inspectInject()`方法中调用到的抽象方法`getMethodList()`

![](https://czxcab.cn/file/docs/mp12.jpg)

我们先来看看`getMethodList()`方法，可以发现这个方法就是我们自定义注入器所重写的方法，那我们再进入`DefaultSqlInjector`看一下这个方法做了什么，

![](https://czxcab.cn/file/docs/mp13.jpg)

从代码可以很清晰的看出，`DefaultSqlInjector`在这里将MP默认实现的CRUD方法进行注入。

上面说了一堆，但是我相信你还是没懂，不如一起debug来看看：这里主要看下数据库信息的获取以及方法的注入。

我们在`AbstractSqlInjector`中的`inspectInject()`方法中打个断点，首先我们可以看到`TableInfoHelper.initTableInfo()`方法获取到了数据库表的相关信息，那么它是如何做到的呢？我们进入刚方法内查看

![](https://czxcab.cn/file/docs/mp14.jpg)

通过查看代码，我们可以看到初始化数据库信息的方法主要为`initTableName()`以及`initTableFields()`

![](https://czxcab.cn/file/docs/mp15.jpg)

`initTableName()`的作用是获取表名信息，主要通过实体上的`@TableName`注解拿到表名，所以我们这里拿到了表名。

![](https://czxcab.cn/file/docs/mp16.jpg)

`initTableFields()`的作用主要为获取主键及其他字段信息，至此，数据库信息则获取成功，可供注入SQL方法时使用。

![](https://czxcab.cn/file/docs/mp17.jpg)

### 方法注入

获取完表信息后，可以发现通过`getMethodList()`方法获取了所有自定义方法，这些方法都是哪里来的呢？都是从`AbstractSqlInjector`抽象类的子类中获取的，比如默认的SQL注入器`DefaultSqlInjector`以及我们自定的Inject。

![](https://czxcab.cn/file/docs/mp18.jpg)

获取所有自定义方法后，可以发现通过调用`AbstractMethod`的`inject()`方法实现了SQL的自动注入，这里也把上文获取到的数据库表对象传入用来进行SQL的封装。

![](https://czxcab.cn/file/docs/mp19.jpg)

可以看到`injectMappedStatement()`方法就是我们自定义方法中所重写的，根据自己的需求重写方法，最后将生成好的`MappedStatement`对象加入到全局配置类对象中。

![](https://czxcab.cn/file/docs/mp20.jpg)

### SQL语句是怎么生成的？
#### AbstractMethod

上面了解了SQL是如何注入后，我们再来看下SQL是怎么生成的。我们直接看`DefaultSqlInjector`提供的默认方法，可以发现所有的方法都继承了`AbstractMethod`。该类主要用于封装Mapper接口中定义的方法信息，并提供了一些默认实现。通过继承`AbstractMethod`类并重写其中的方法，我们可以自定义生成 SQL 语句的方式，从而实现更加灵活的 SQL 操作。

该类我们目前只需要关注`inject()`方法，它主要通过`injectMappedStatement()`方法实现了自动注入SQL的动作。`injectMappedStatement()`是一个模板方法，每个自定义SQL类都可以对其进行重写，然后将封装好的sql存放到全局配置文件类中。

这里我们以`SelectById`类作为案例来对其分析。

首先可以看到在构造方法中将`SqlMethod`枚举类中定义好的方法名传入到父类中，方便后续使用；同时重写`injectMappedStatement()`方法，通过SQL模板构建出SQL语句并存入到全局配置类中。

![](https://czxcab.cn/file/docs/mp21.jpg)

#### SqlMethod

![](https://czxcab.cn/file/docs/mp22.jpg)

`SqlMethod`就是一个枚举类，存储了两个关键的元素：

- `BaseMapper`中的方法名
- 方法名对应的sql语句模板
看到这两个元素，相信大家应该已经知道SQL自动生成的本质了：根据不同的方法来提供一些通用的模板，项目启动后再将其加载进`mappedStatement`。

#### SqlSource

`SqlSource`对象里面则是通过解析SQL模板、以及传入的表信息和主键信息构建出了一条SQL语句：

![](https://czxcab.cn/file/docs/mp23.jpg)

可能会有人疑惑这里的表信息是从何而来，其实这些表信息就是在SQL注入的时候获取的表信息，然后传到`AbstractMethod`中的，所以在重写`injectMappedStatement()`方法的时候就可以使用到了。

![](https://czxcab.cn/file/docs/mp24.jpg)

### Mapper文件被添加的过程

看完上述内容相信大家应该都知道了SQL注入器的基本原理了，那么SQL注入器是在哪里添加到Mybatis中的呢？如果不太清楚的话，我们带着问题往下看。

首先我们回顾下Mybatis 的执行流程，一般可以分为以下几个步骤：

1. 加载配置文件：在应用启动时，Mybatis 会读取配置文件`mybatis-config.xml`并解析其中的配置信息，例如数据库连接信息、映射器信息等。
2. 创建 `SqlSessionFactory`：通过`SqlSessionFactoryBuilder` 类加载配置文件中的信息，并创建 `SqlSessionFactory` 对象。`SqlSessionFactory` 是一个重量级的对象，它的作用是创建 `SqlSession` 对象，`SqlSession` 是用于执行 SQL 语句的核心对象。
3. 创建 `SqlSession`：通过 `SqlSessionFactory` 的 `openSession` 方法创建 `SqlSession` 对象。在执行 SQL 操作时，我们需要通过 SqlSession 对象获取到对应的 Mapper 接口，然后调用该接口中定义的方法来执行 SQL 语句。
4. 获取 `Mapper` 接口：在 Mybatis 中，我们通常通过 `Mapper` 接口的方式执行 SQL 操作。因此，在获取 `Mapper` 接口之前，我们需要先配置映射关系，即在配置文件中指定 `Mapper` 接口所对应的 XML 文件或注解类。在创建 `SqlSession` 对象后，我们可以通过 `SqlSession` 的 `getMapper` 方法获取到对应的 `Mapper` 接口。
5. 执行 SQL 语句：当我们获取到 `Mapper` 接口后，就可以通过调用其方法执行 SQL 语句了。在执行 SQL 语句前，Mybatis 会将 `Mapper` 接口中定义的 SQL 语句转换成 `MappedStatement` 对象，并将其中的参数信息传递给 `Executor` 对象执行 SQL 语句。
6. 处理 SQL 语句的执行结果：在执行 SQL 语句后，Mybatis 会将查询结果封装成对应的 Java 对象并返回。

![](https://czxcab.cn/file/docs/mp25.jpg)

### MP入口

可能有些人不知道MP的具体入口从哪里看，其实很简单，我们可以直接去`mybatis-plus-boot-starter`中`resources`下的`META-INF`文件夹下查看：

![](https://czxcab.cn/file/docs/mp26.jpg)

可以看到配置的自动启动类是`MybatisPlusAutoConfiguration`；

这个类由于实现了`InitializingBean`接口，得到了`afterPropertiesSet`方法，在Bean初始化后，会自动调用。 还有三个标注了 `@ConditionalOnMissingBean` 注解的方法，说明这些方法在没有配置对应对象时会由SpringBoot创建Bean，并且保存到容器中。

所以`sqlSessionFactory`方法在没有配置`SqlSessionFactory`时会由SpringBoot创建Bean，并且保存到容器中。

### MybatisSqlSessionFactoryBean

我们可以发现进入`sqlSessionFactory`方法后就会实例化`MybatisSqlSessionFactoryBean`类，那么该类到底做了什么呢？

![](https://czxcab.cn/file/docs/mp27.jpg)

可以发现该类实现了三个接口`FactoryBean<SqlSessionFactory>`, `InitializingBean`, `ApplicationListener<ApplicationEvent>`：

1. `FactoryBean`：说明用到了工厂模式

2. `InitializingBean`：`afterPropertiesSet` 在属性设置完成时调用（在Bean创建完成时）调用

3. `ApplicationListener`是一个监听器，监听的是`ApplicationContext`初始化或者刷新事件，当初始化或者刷新时调用。

这里我们主要看初始化后调用的方法`afterPropertiesSet`：可以发现在该方法中调用了`buildSqlSessionFactory`方法。

![](https://czxcab.cn/file/docs/mp28.jpg)

### buildSqlSessionFactory

那么`buildSqlSessionFactory`方法做了些什么呢？简单的说就是创建一个`SqlSessionFactory`实例，虽然里面还有很多其他步骤，但是不在本文谈论范围内。

我们直接看最重要的部分`xmlMapperBuilder.parse()`：

![](https://czxcab.cn/file/docs/mp29.jpg)

`parse`方法主要用来解析xml文件，`bindMapperForNamespace`方法则用来解析接口文件。

![](https://czxcab.cn/file/docs/mp30.jpg)

`addMapper`方法是由前面`MybatisConfiguration`调用的。

![](https://czxcab.cn/file/docs/mp31.jpg)

我们进入`MybatisConfiguration`这里会解析出对应的类型，然后内部调用`MybatisMapperRegistry`的方法：

![](https://czxcab.cn/file/docs/mp32.jpg)

内部最后是由`MybatisMapperAnnotationBuilder`去解析的：

![](https://czxcab.cn/file/docs/mp33.jpg)

可以发现最后又回到了我们最初说到的`AbstractSqlInjector`类中的`inspectInject`方法，该类帮助我们实现了基本SQL方法的自动注入。

![](https://czxcab.cn/file/docs/mp34.jpg)

到这里相信大家已经对SQL注入器的原理有了一个清楚的认识了，如果还不太理解的话，可以从MP入口处开始，根据截图的内容自行打断点熟悉下。
