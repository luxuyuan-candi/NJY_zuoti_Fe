const { loginByCode } = require('../../utils/services');

Page({
  login() {
    wx.login({
      success: ({ code }) => {
        loginByCode({ code })
          .then((data) => {
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('user', data.user);
            const app = getApp();
            app.globalData.token = data.token;
            app.globalData.user = data.user;
            wx.showToast({ title: '登录成功', icon: 'success' });
            setTimeout(() => wx.navigateBack({ delta: 1 }), 500);
          })
          .catch(() => {
            wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' });
          });
      }
    });
  },

  goAgreement() {
    wx.navigateTo({ url: '/pages/agreement/index' });
  }
});
