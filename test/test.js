const { expect } = require('chai');
const Wechat = require('../');
const { appid, secret, url } = require('./wechat.config');

const delay = time => new Promise((resolve) => {
  setTimeout(resolve, time);
});

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
        .then((accessToken) => {
          expect(accessToken).to.be.a('string');
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
        .then((ticket) => {
          expect(ticket).to.be.a('string');
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
  describe('cached accessToken', () => {
    it('should be get same token', async () => {
      const wechat = new Wechat(appid, secret);
      const accessToken = await wechat.getAccessToken();
      await delay(1000);
      const accessToken2 = await wechat.getAccessToken();
      expect(accessToken).to.equal(accessToken2);
    });
  });
  describe('cached ticket', () => {
    it('should be get same ticket', async () => {
      const wechat = new Wechat(appid, secret);
      const ticket = await wechat.getJSAPITicket();
      await delay(1000);
      const ticket2 = await wechat.getJSAPITicket();
      expect(ticket).to.equal(ticket2);
    });
  });
});

