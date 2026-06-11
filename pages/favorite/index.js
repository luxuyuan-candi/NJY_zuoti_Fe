const { getFavorites, removeFavorite } = require('../../utils/services');

Page({
  data: {
    favorites: []
  },

  onShow() {
    getFavorites()
      .then((favorites) => this.setData({ favorites }))
      .catch(() => wx.showToast({ title: '请先登录', icon: 'none' }));
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    removeFavorite(id)
      .then((favorites) => this.setData({ favorites }))
      .catch(() => wx.showToast({ title: '取消收藏失败', icon: 'none' }));
  },

  practice() {
    if (!this.data.favorites.length) {
      wx.showToast({ title: '当前没有收藏题', icon: 'none' });
      return;
    }
    getApp().globalData.currentFavoriteSet = this.data.favorites || [];
    wx.navigateTo({ url: '/pages/practice/settings?source=favorite' });
  },

  openDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/favorite/detail?id=${id}` });
  }
});
