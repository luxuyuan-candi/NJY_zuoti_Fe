const { getMistakes, removeMistake } = require('../../utils/services');

Page({
  data: {
    mistakes: []
  },

  onShow() {
    getMistakes()
      .then((mistakes) => this.setData({ mistakes }))
      .catch(() => this.setData({ mistakes: [] }));
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    removeMistake(id)
      .then((mistakes) => this.setData({ mistakes }))
      .catch(() => wx.showToast({ title: '移出失败', icon: 'none' }));
  },

  practice() {
    wx.navigateTo({ url: '/pages/practice/settings?source=mistake' });
  }
});
