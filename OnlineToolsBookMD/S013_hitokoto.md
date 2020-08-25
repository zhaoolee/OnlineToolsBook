---
title: S013《一言》总有那么几个句子能穿透你的心
---


## 直达链接: [https://hitokoto.cn/](https://hitokoto.cn/)





**打开网页就会随机弹出一句触动心灵的句子**
![](https://www.v2fy.com/asset/0i/OnlineToolsBook/OnlineToolsBookMD/S013_hitokoto.assets/hitokoto-yiyan.png)


网站提供了第三方接口,任何人可以通过接口`https://v1.hitokoto.cn/`获取一句话

![](https://www.v2fy.com/asset/0i/OnlineToolsBook/OnlineToolsBookMD/S013_hitokoto.assets/api.png)


也可以引用到自己到网站

效果:

![](https://www.v2fy.com/asset/0i/OnlineToolsBook/OnlineToolsBookMD/S013_hitokoto.assets/yiyan-001.png)

代码块:

```javascript
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.0/jquery.min.js"
      integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ="
      crossorigin="anonymous"
    ></script>

    <div id="yiyan"></div>

    <script>
      jQuery
        .ajax({ url: "https://v1.hitokoto.cn/" })
        .done(function(content, err) {
          console.log("content::", content, "err::", err);
          if (err === "success") {
            var result = "";
            content = JSON.parse(content);
            result = content.hitokoto + "&nbsp;--" + content.from;
            console.log("=result=>>", result);
            result = content.hitokoto + "&nbsp;--" + content.from;
            jQuery("#yiyan").html(result);
          }
        });
    </script>
```
