const { getRecordDashboard } = require('../../utils/services');

Page({
  data: {
    records: [],
    stats: [
      { label: '总做题数', value: '0' },
      { label: '正确率', value: '0%' },
      { label: '考试数', value: '0' }
    ],
    mistakeDesc: '完成练习后生成',
    favoriteDesc: '做题时点击收藏生成',
    trendDesc: '完成练习后生成',
    hasCompletedPractice: false
  },

  onShow() {
    getRecordDashboard()
      .then((dashboard) => {
        const recentRecords = (dashboard.records || []).slice(0, 4);
        this.setData({
          records: recentRecords,
          stats: dashboard.stats || this.data.stats,
          mistakeDesc: dashboard.hasCompletedPractice
            ? `${dashboard.mistakeCount || 0} 道待复盘`
            : '完成练习后生成',
          favoriteDesc: `${dashboard.favoriteCount || 0} 道已收藏`,
          trendDesc: dashboard.hasCompletedPractice
            ? `${(dashboard.records || []).length} 次完成记录`
            : '完成练习后生成',
          hasCompletedPractice: !!dashboard.hasCompletedPractice
        });
      })
      .catch(() => this.setData({ records: [], hasCompletedPractice: false }));
  },

  goMistake() {
    if (!this.data.hasCompletedPractice) {
      wx.showToast({ title: '请先完成一次练习', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/mistake/index' });
  },

  goFavorite() {
    wx.navigateTo({ url: '/pages/favorite/index' });
  },

  goTrend() {
    if (!this.data.hasCompletedPractice) {
      wx.showToast({ title: '请先完成一次练习', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/record/trend' });
  },

  goResult(e) {
    const { id, type } = e.currentTarget.dataset;
    wx.navigateTo({ url: type === '考试' ? '/pages/exam/result' : `/pages/practice/result?recordId=${id}` });
  }
});
