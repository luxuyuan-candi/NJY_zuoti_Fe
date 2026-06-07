const { getMistakes } = require('../../utils/services');

Page({
  data: {
    mistakes: []
  },

  onLoad() {
    getMistakes()
      .then((mistakes) => this.setData({ mistakes }))
      .catch(() => wx.showToast({ title: '请先登录', icon: 'none' }));
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ mistakes: this.data.mistakes.filter((item) => item.id !== id) });
  },

  practice() {
    wx.navigateTo({ url: '/pages/practice/settings?source=mistake' });
  }
});
