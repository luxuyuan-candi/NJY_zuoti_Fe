const { getPracticeRecord } = require('../../utils/services');

Page({
  data: {
    recordId: '',
    title: '',
    heroTitle: '本次练习已完成',
    heroSubtitle: '',
    metrics: [
      { label: '总题数', value: '0' },
      { label: '正确', value: '0' },
      { label: '正确率', value: '0%' }
    ],
    details: []
  },

  onLoad(query) {
    this.setData({
      recordId: query.recordId || ''
    });
  },

  onShow() {
    const fallbackResult = getApp().globalData.lastPracticeResult || null;
    if (this.data.recordId) {
      getPracticeRecord(this.data.recordId)
        .then((record) => this.applyResult(record || fallbackResult))
        .catch(() => this.applyResult(fallbackResult));
      return;
    }
    this.applyResult(fallbackResult);
  },

  applyResult(result) {
    if (!result) return;
    this.setData({
      title: result.title || '',
      heroTitle: `本次正确率 ${result.accuracy}%`,
      heroSubtitle: `${result.title || '练习结果'} - 共完成 ${result.answeredCount} 题 - 答错 ${result.wrongCount} 题`,
      metrics: [
        { label: '总题数', value: String(result.answeredCount) },
        { label: '正确', value: String(result.correctCount) },
        { label: '正确率', value: `${result.accuracy}%` }
      ],
      details: result.details || []
    });
  },

  goMistake() {
    if (!this.data.recordId) {
      wx.navigateTo({ url: '/pages/mistake/index' });
      return;
    }
    wx.navigateTo({ url: `/pages/mistake/index?recordId=${this.data.recordId}` });
  },

  retry() {
    wx.reLaunch({ url: '/pages/bank/index' });
  }
});
