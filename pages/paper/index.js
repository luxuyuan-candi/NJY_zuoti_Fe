const { getPapers } = require('../../utils/services');

Page({
  data: {
    papers: [],
    filters: ['全部', '模拟卷', '课程卷', '错题卷']
  },

  onLoad() {
    getPapers()
      .then((papers) => this.setData({ papers }))
      .catch(() => wx.showToast({ title: '请先登录并等待授权', icon: 'none' }));
  },

  goIntro(e) {
    wx.navigateTo({ url: `/pages/exam/intro?id=${e.currentTarget.dataset.id}` });
  }
});
