Page({
  data: {
    counts: [10, 20, 30, 50],
    selectedCount: 20,
    order: '顺序出题',
    showAnalysis: true,
    onlyUnfinished: false
  },

  selectCount(e) {
    this.setData({ selectedCount: e.currentTarget.dataset.count });
  },

  toggleAnalysis(e) {
    this.setData({ showAnalysis: e.detail.value });
  },

  toggleUnfinished(e) {
    this.setData({ onlyUnfinished: e.detail.value });
  },

  start() {
    wx.navigateTo({ url: '/pages/practice/answer' });
  }
});
