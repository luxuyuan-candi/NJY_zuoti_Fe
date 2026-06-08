App({
  globalData: {
    baseUrl: 'https://www.njwjxy.cn:30443/api/miniapp',
    assetBaseUrl: 'https://www.njwjxy.cn:30443/zuoti-minio/public-assets',
    appId: 'wxb88840bf78c6cd4d',
    token: '',
    user: {
      id: '',
      openid: '',
      nickname: '',
      avatarUrl: '',
      email: '',
      role: 'USER',
      roleLabel: '普通用户',
      authorized: false
    }
  },

  onLaunch() {
    const token = wx.getStorageSync('token') || '';
    const user = wx.getStorageSync('user') || this.globalData.user;
    this.globalData.token = token;
    this.globalData.user = user;
  }
});
