const { getFavoriteDetail } = require('../../utils/services');

Page({
  data: {
    question: null,
    loading: true
  },

  onLoad(query) {
    this.loadDetail(query.id || '');
  },

  loadDetail(id) {
    if (!id) {
      this.setData({ loading: false });
      wx.showToast({ title: '收藏题不存在', icon: 'none' });
      return;
    }
    getFavoriteDetail(id)
      .then((detail) => {
        this.setData({
          question: detail,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '加载详情失败', icon: 'none' });
      });
  }
});
