## snakemq 跨页面的消息通信组件

### 使用方法

```JavaScript

snakemq.addListener("aaa",function (value) {
    console.log(value);
});

function sendMessage() {
    snakemq.sendMessage("aaa",111);
}

```

### api

```JavaScript
// 设置监听
snakemq.addListener(name,callback);

// 移除监听，当callback为空时候，移除当前消息所有监听
snakemq.removeListener(name,callback);

// value需要保证可以序列化
snakemq.sendMessge(name,value);

```