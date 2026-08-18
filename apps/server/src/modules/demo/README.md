# Demo 模块：接口入门示例

这里有 4 个最简单的接口，照着看一遍就会写。

## 接口一览

| 方法 | 路径 | 参数 |
| --- | --- | --- |
| GET | `/demo/ping` | 无 |
| GET | `/demo/hello?name=张三` | 查询参数 |
| GET | `/demo/detail/1001` | 路径参数 |
| POST | `/demo/create` | JSON 请求体 |

## 怎么读代码

`@Controller('demo')` 是前缀，接口都以 `/demo` 开头。
`@Get('ping')` 是 GET 方法加路径，合起来就是 `GET /demo/ping`。
`@Query('name')` 取问号后面的参数，`@Param('id')` 取路径里的值，`@Body()` 取 JSON 请求体。

```ts
@Get('ping')
ping() {
  return this.demoService.ping()
}

@Get('hello')
hello(@Query('name') name: string) {
  return this.demoService.hello(name)
}

@Get('detail/:id')
getDetail(@Param('id') id: string) {
  return this.demoService.getDetail(id)
}

@Post('create')
create(@Body() createDemoDto: CreateDemoDto) {
  return this.demoService.create(createDemoDto)
}
```

`CreateDemoDto` 用 `@IsString()`、`@Length(1, 20)` 校验参数，不合法自动返回 400。

分工：Controller 只收参数，Service 写逻辑。

## 怎么学

1. 启动：`cd apps/server && pnpm dev`
2. 浏览器打开 `http://localhost:3000/demo/ping`
3. 再试 `http://localhost:3000/demo/hello?name=小明`
4. 把 demo 目录复制一份改成自己的名字，照着写自己的接口

参考：[NestJS 官方文档](https://docs.nestjs.com)
