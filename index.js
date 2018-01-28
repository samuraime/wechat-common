const crypto = require('crypto');
const querystring = require('querystring');
const fetch = require('isomorphic-fetch');

const request = async (url) => {
  const res = await fetch(url);
  const { errcode, errmsg, ...other } = await res.json();
  if (errcode) {
    throw new Error(`WechatAPI: ${errmsg}`);
  }

  return other;
};

/**
 * 获取微信公众号普通AccessToken
 *
 * 获取expire_in 7200s, 需全局缓存
 * @param {String} appid
 * @param {String} secret
 * @return {Promise}  { accessToken, expiresIn }
 */
const getAccessToken = async (appid, secret) => {
  // {"access_token":"ACCESS_TOKEN","expires_in":7200}
  const { access_token: accessToken, expires_in: expiresIn } = await request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`);

  return { accessToken, expiresIn };
};

/**
 * 获取JSAPITicket
 *
 * expire_in 7200s, 需全局缓存
 * @param {String} accessToken
 * @return {Promise} { ticket, expiresIn }
 */
const getJSAPITicket = async (accessToken) => {
  // {"ticket":"ACCESS_TOKEN","expires_in":7200}
  const { ticket, expires_in: expiresIn } = await request(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`);

  return { ticket, expiresIn };
};

/**
 * 32位随机字符串
 */
const random = () => crypto.randomBytes(16).toString('hex');

/**
 * @param {String} accessToken
 * @param {String} ticket
 * @param {String} url
 * @return {Object} { appId, timestamp, nonceStr, signature }
 */
const getJSAPIConfig = (appid, accessToken, ticket, url) => {
  const timestamp = Number.parseInt(Date.now() / 1000, 10);
  const nonceStr = random();
  // 字典顺序
  const signStr = querystring.stringify({
    jsapi_ticket: ticket,
    noncestr: nonceStr,
    timestamp,
    url: url.replace(/#.*/, ''),
  }, '&', '=', {
    encodeURIComponent: String,
  });
  const signature = crypto.createHash('sha1').update(signStr).digest('hex');

  return {
    appId: appid,
    timestamp,
    nonceStr,
    signature,
  };
};

const store = {};

const isValid = expiresAt => Date.now() < expiresAt;

class Wechat {
  /**
   * @param {String} appid
   * @param {String} secret
   * @param {Object} [options]
   * @param {Function} [options.getAccessToken]
   * @param {Function} [options.setAccessToken]
   * @param {Function} [options.getJSAPITicket]
   * @param {Function} [options.setJSAPITicket]
   */
  constructor(appid, secret, {
    get = key => store[key],
    set = (key, value) => { store[key] = value; },
    accessTokenKey = 'accessToken',
    JSAPITicketKey = 'JSAPITicket',
  } = {}) {
    this.appid = appid;
    this.secret = secret;
    this.get = get;
    this.set = set;
    this.accessTokenKey = accessTokenKey;
    this.JSAPITicketKey = JSAPITicketKey;
  }

  async getAccessToken() {
    const accessTokenData = await this.get(this.accessTokenKey);
    if (accessTokenData && isValid(accessTokenData.expiresAt)) {
      return accessTokenData.value;
    }

    const createdAt = Date.now();
    const { accessToken, expiresIn } = await getAccessToken(this.appid, this.secret);
    await this.set(this.accessTokenKey, {
      value: accessToken,
      expiresAt: createdAt + (expiresIn * 1000),
    });

    return accessToken;
  }

  async getJSAPITicket() {
    const JSAPITicketData = await this.get(this.JSAPITicketKey);
    if (JSAPITicketData && isValid(JSAPITicketData.expiresAt)) {
      return JSAPITicketData.value;
    }

    const createdAt = Date.now();
    const accessToken = await this.getAccessToken();
    const { ticket, expiresIn } = await getJSAPITicket(accessToken);
    await this.set(this.JSAPITicketKey, {
      value: ticket,
      expiresAt: createdAt + (expiresIn * 1000),
    });

    return ticket;
  }

  async getJSAPIConfig(url) {
    const accessToken = await this.getAccessToken();
    const ticket = await this.getJSAPITicket(accessToken);

    return getJSAPIConfig(this.appid, accessToken, ticket, url);
  }
}

module.exports = Wechat;

module.exports.getAccessToken = getAccessToken;
module.exports.getJSAPITicket = getJSAPITicket;
module.exports.getJSAPIConfig = getJSAPIConfig;
