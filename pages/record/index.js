const { ensureIdentity, getRecordDashboard } = require('../../utils/services');

Page({
  data: {
    authorized: true,
    unauthorizedMessage: '游客无权查看记录，请先完成身份配置并联系管理员授权。',
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
    ensureIdentity()
      .then((user) => {
        if (user && user.role === 'GUEST') {
          this.setData({
            authorized: false,
            unauthorizedMessage: '游客无权查看记录，请先完成身份配置并联系管理员授权。',
            records: [],
            hasCompletedPractice: false,
            stats: [
              { label: '总做题数', value: '0' },
              { label: '正确率', value: '0%' },
              { label: '考试数', value: '0' }
            ],
            mistakeDesc: '完成练习后生成',
            favoriteDesc: '做题时点击收藏生成',
            trendDesc: '完成练习后生成'
          });
          return null;
        }
        return getRecordDashboard();
      })
      .then((dashboard) => {
        if (!dashboard) return;
        const recentRecords = (dashboard.records || []).slice(0, 4);
        this.setData({
          authorized: true,
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
      .catch((error) => {
        const unauthorized = error && (error.statusCode === 401 || error.statusCode === 403 || error.detail);
        this.setData({
          authorized: false,
          unauthorizedMessage: unauthorized
            ? '游客无权查看记录，请先完成身份配置并联系管理员授权。'
            : '记录暂时不可用，请稍后重试。',
          records: [],
          hasCompletedPractice: false
        });
      });
  },

  goMistake() {
    if (!this.data.authorized) return;
    if (!this.data.hasCompletedPractice) {
      wx.showToast({ title: '请先完成一次练习', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/mistake/index' });
  },

  goFavorite() {
    if (!this.data.authorized) return;
    wx.navigateTo({ url: '/pages/favorite/index' });
  },

  goTrend() {
    if (!this.data.authorized) return;
    if (!this.data.hasCompletedPractice) {
      wx.showToast({ title: '请先完成一次练习', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/record/trend' });
  },

  goResult(e) {
    if (!this.data.authorized) return;
    const { id, type } = e.currentTarget.dataset;
    wx.navigateTo({ url: type === '考试' ? '/pages/exam/result' : `/pages/practice/result?recordId=${id}` });
  }
});
