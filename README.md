# wechat-common

获取微信公众号普通AccessToken, JSAPITicket, JSSDKConfig

## Install

```sh
npm install wechat-common --save
```

## 单线程使用
```js
const Wechat = require('wechat-common');

const wechat = new Wechat(appid, secret);

// 获取普通accessToken
const accessToken = await wechat.getAccessToken();

// 获取jsapi_ticket
const JSAPITicket = await wechat.getJSAPITicket();

// 获取jsapi配置
const JSAPIConfig = await wechat.getJSAPIConfig();
```


## 多线程使用

多线程使用时需要全局缓存accessToken与JSAPITicket, 需要传入全局缓存函数

```js
const wechat = new Wechat(appid, secret, {
  get: async (key) => { // 获取全局缓存
    const v = await globalStore.get(key);
    return v;
  },
  set: async (key, value) => { // 保存全局缓存
    await globalStore.set(key);
  },
  accessTokenKey: 'accessToken', // get, set的key值, 可选
  JSAPITicketKey: 'JSAPITicket', // get, set的key值, 可选
});
```

# License

[MIT](LICENSE)
