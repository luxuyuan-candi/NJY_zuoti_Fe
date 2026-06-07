const { favorites } = require('../../utils/mock');

Page({
  data: {
    favorites
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ favorites: this.data.favorites.filter((item) => item.id !== id) });
  },

  practice() {
    wx.navigateTo({ url: '/pages/practice/answer?source=favorite' });
  }
});
