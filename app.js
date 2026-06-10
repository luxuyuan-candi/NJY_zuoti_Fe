const { ensureIdentity } = require('./utils/services');

App({
  globalData: {
    baseUrl: 'https://www.njwjxy.cn:30443/api/miniapp',
    assetBaseUrl: 'https://www.njwjxy.cn:30443/zuoti-minio/public-assets',
    appId: 'wxb88840bf78c6cd4d',
    token: '',
    currentMistakeSet: [],
    lastPracticeConfig: null,
    lastPracticeResult: null,
    user: {
      id: '',
      openid: '',
      nickname: '',
      avatarUrl: '',
      email: '',
      role: 'GUEST',
      roleLabel: '游客',
      authorized: false
    }
  },

  onLaunch() {
    const token = wx.getStorageSync('token') || '';
    const user = wx.getStorageSync('user') || this.globalData.user;
    this.globalData.token = token;
    this.globalData.user = user;
    ensureIdentity().catch(() => {});
  }
});
