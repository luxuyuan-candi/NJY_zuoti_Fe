Page({
  data: {
    showAnalysis: true,
    defaultCount: 20
  },

  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('user');
    wx.showToast({ title: '已退出', icon: 'none' });
  }
});
