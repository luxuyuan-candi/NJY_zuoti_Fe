Page({
  data: {
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

  onShow() {
    const result = getApp().globalData.lastPracticeResult || null;
    if (!result) {
      return;
    }
    this.setData({
      title: result.title || '',
      heroTitle: `本次正确率 ${result.accuracy}%`,
      heroSubtitle: `${result.title || '练习结果'}，共完成 ${result.answeredCount} 题，答错 ${result.wrongCount} 题。`,
      metrics: [
        { label: '总题数', value: String(result.answeredCount) },
        { label: '正确', value: String(result.correctCount) },
        { label: '正确率', value: `${result.accuracy}%` }
      ],
      details: result.details || []
    });
  },

  goMistake() {
    wx.navigateTo({ url: '/pages/mistake/index' });
  },

  retry() {
    const app = getApp();
    const retryConfig = (app.globalData.lastPracticeResult && app.globalData.lastPracticeResult.retryConfig)
      || app.globalData.lastPracticeConfig
      || null;
    if (!retryConfig || !retryConfig.bankId) {
      wx.showToast({ title: '缺少练习上下文', icon: 'none' });
      return;
    }
    const targetUrl = `/pages/chapter/index?id=${retryConfig.bankId}`;
    const pages = getCurrentPages();
    const backDelta = Math.min(3, Math.max(pages.length - 1, 0));

    if (backDelta > 0) {
      wx.navigateBack({
        delta: backDelta,
        success: () => {
          wx.redirectTo({ url: targetUrl });
        },
        fail: () => {
          wx.redirectTo({ url: targetUrl });
        }
      });
      return;
    }

    wx.redirectTo({ url: targetUrl });
  }
});
