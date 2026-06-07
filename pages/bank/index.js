const { getBanks } = require('../../utils/services');

Page({
  data: {
    authorized: true,
    tabs: ['全部', '考试类', '课程类'],
    activeTab: '全部',
    banks: [],
    loading: false
  },

  onShow() {
    this.loadBanks();
  },

  loadBanks() {
    this.setData({ loading: true });
    getBanks()
      .then((banks) => this.setData({ banks, authorized: true }))
      .catch(() => this.setData({ authorized: false }))
      .finally(() => this.setData({ loading: false }));
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab;
    this.setData({ activeTab });
  },

  goChapter(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/chapter/index?id=${id}` });
  }
});
