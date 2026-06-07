Page({
  login() {
    wx.login({
      success() {
        wx.setStorageSync('token', 'demo-token');
        wx.setStorageSync('user', {
          id: 'u-demo',
          nickname: '学习用户',
          authorized: true
        });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 500);
      }
    });
  },

  goAgreement() {
    wx.navigateTo({ url: '/pages/agreement/index' });
  }
});
