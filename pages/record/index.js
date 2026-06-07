const { records } = require('../../utils/mock');

Page({
  data: {
    records,
    stats: [
      { label: '总做题', value: '626' },
      { label: '正确率', value: '81%' },
      { label: '考试', value: '3' }
    ]
  },

  goMistake() {
    wx.navigateTo({ url: '/pages/mistake/index' });
  },

  goFavorite() {
    wx.navigateTo({ url: '/pages/favorite/index' });
  },

  goTrend() {
    wx.navigateTo({ url: '/pages/record/trend' });
  },

  goResult(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({ url: type === '考试' ? '/pages/exam/result' : '/pages/practice/result' });
  }
});
