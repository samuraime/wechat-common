const { expect } = require('chai');
const Wechat = require('../');
const { appid, secret, url } = require('./wechat.config');

describe('Wechat', () => {
  describe('Wechat.getAccessToken', () => {
    it('should be ok', async () => {
      Wechat.getAccessToken(appid, secret)
        .then((res) => {
          expect(res.accessToken).to.be.a('string');
          expect(res.expiresIn).to.be.a('number');
        })
        .catch((e) => {
          expect(e.message).to.include('WechatAPI');
        });
    });
  });
  describe('Wechat.getJSAPITicket', () => {
    it('should be ok', async () => {
      const { accessToken } = await Wechat.getAccessToken(appid, secret);
      Wechat.getJSAPITicket(accessToken)
        .then((res) => {
          expect(res.ticket).to.be.a('string');
          expect(res.expiresIn).to.be.a('number');
        })
        .catch((e) => {
          expect(e.message).to.include('WechatAPI');
        });
    });
  });
  describe('Wechat.getJSAPIConfig', () => {
    it('should be ok', async () => {
      const { accessToken } = await Wechat.getAccessToken(appid, secret);
      const { ticket } = await Wechat.getJSAPITicket(accessToken);
      const config = Wechat.getJSAPIConfig(appid, accessToken, ticket, url);

      expect(config.appId).to.be.a('string');
      expect(config.timestamp).to.be.a('number');
      expect(config.nonceStr).to.be.a('string');
      expect(config.signature).to.be.a('string');
    });
  });
  describe('wechat.getAccessToken', () => {
    it('should be ok', async () => {
      const wechat = new Wechat(appid, secret);
      wechat.getAccessToken()
        .then((res) => {
          expect(res.accessToken).to.be.a('string');
          expect(res.expiresIn).to.be.a('number');
        })
        .catch((e) => {
          expect(e.message).to.include('WechatAPI');
        });
    });
  });
  describe('wechat.getJSAPITicket', () => {
    it('should be ok', async () => {
      const wechat = new Wechat(appid, secret);
      wechat.getJSAPITicket()
        .then((res) => {
          expect(res.ticket).to.be.a('string');
          expect(res.expiresIn).to.be.a('number');
        })
        .catch((e) => {
          expect(e.message).to.include('WechatAPI');
        });
    });
  });
  describe('wechat.getJSAPIConfig', () => {
    it('should be ok', async () => {
      const wechat = new Wechat(appid, secret);
      wechat.getJSAPIConfig(url)
        .then((config) => {
          expect(config.appId).to.be.a('string');
          expect(config.timestamp).to.be.a('number');
          expect(config.nonceStr).to.be.a('string');
          expect(config.signature).to.be.a('string');
        })
        .catch((e) => {
          expect(e.message).to.include('WechatAPI');
        });
    });
  });
});
