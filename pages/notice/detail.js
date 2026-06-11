const { getCurrentNotice } = require('../../utils/services');

Page({
  data: {
    notice: {
      title: '题库授权说明',
      content: '用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。'
    }
  },

  onShow() {
    const cached = wx.getStorageSync('homeNotice');
    if (cached) {
      this.setData({ notice: cached });
    }
    getCurrentNotice()
      .then((notice) => {
        wx.setStorageSync('homeNotice', notice);
        this.setData({ notice });
      })
      .catch(() => {});
  }
});
