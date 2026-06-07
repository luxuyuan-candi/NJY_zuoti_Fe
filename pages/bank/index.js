const { banks } = require('../../utils/mock');

Page({
  data: {
    authorized: true,
    tabs: ['全部', '考试类', '课程类'],
    activeTab: '全部',
    banks
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
