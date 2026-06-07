const { getFavorites } = require('../../utils/services');

Page({
  data: {
    favorites: []
  },

  onLoad() {
    getFavorites()
      .then((favorites) => this.setData({ favorites }))
      .catch(() => wx.showToast({ title: '请先登录', icon: 'none' }));
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ favorites: this.data.favorites.filter((item) => item.id !== id) });
  },

  practice() {
    wx.navigateTo({ url: '/pages/practice/answer?source=favorite' });
  }
});
