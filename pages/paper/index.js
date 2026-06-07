const { papers } = require('../../utils/mock');

Page({
  data: {
    papers,
    filters: ['全部', '模拟卷', '课程卷', '错题卷']
  },

  goIntro(e) {
    wx.navigateTo({ url: `/pages/exam/intro?id=${e.currentTarget.dataset.id}` });
  }
});
