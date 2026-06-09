Page({
  data: {
    title: '',
    bankId: '',
    chapterKey: '',
    bankName: '',
    totalQuestions: 0,
    counts: [10, 20, 30, 50],
    selectedCount: 10,
    order: '顺序出题',
    showAnalysis: true,
    onlyUnfinished: false
  },

  onLoad(query) {
    const app = getApp();
    const fallbackConfig = app.globalData.lastPracticeConfig || null;
    const resolvedQuery = Object.keys(query || {}).length ? query : (fallbackConfig || {});
    const totalQuestions = Number(resolvedQuery.total || 0);
    const counts = [10, 20, 30, 50].filter((count) => count <= totalQuestions);
    const resolvedCounts = counts.length ? counts : [Math.max(1, totalQuestions || 10)];
    this.setData({
      title: decodeURIComponent(resolvedQuery.title || ''),
      bankId: resolvedQuery.bankId || '',
      chapterKey: decodeURIComponent(resolvedQuery.chapterKey || ''),
      bankName: decodeURIComponent(resolvedQuery.bankName || ''),
      totalQuestions,
      counts: resolvedCounts,
      selectedCount: resolvedCounts.includes(Number(resolvedQuery.selectedCount))
        ? Number(resolvedQuery.selectedCount)
        : resolvedCounts[0]
    });
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
    const { bankId, chapterKey, selectedCount, title, bankName, order } = this.data;
    getApp().globalData.lastPracticeConfig = {
      bankId,
      chapterKey,
      selectedCount,
      title,
      bankName,
      total: this.data.totalQuestions
    };
    wx.navigateTo({
      url: `/pages/practice/answer?bankId=${bankId}&chapterKey=${encodeURIComponent(chapterKey || '')}&count=${selectedCount}&title=${encodeURIComponent(title || '')}&bankName=${encodeURIComponent(bankName || '')}&order=${encodeURIComponent(order)}&total=${this.data.totalQuestions || 0}`
    });
  }
});
