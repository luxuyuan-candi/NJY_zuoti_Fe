const { mistakes } = require('../../utils/mock');

Page({
  data: {
    mistakes
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ mistakes: this.data.mistakes.filter((item) => item.id !== id) });
  },

  practice() {
    wx.navigateTo({ url: '/pages/practice/settings?source=mistake' });
  }
});
