Page({
  data: {
    title: '',
    bankId: '',
    chapterKey: '',
    bankName: '',
    totalQuestions: 0,
    countOptions: [],
    selectedCount: 1,
    selectedCountIndex: 0,
    order: '随机出题',
    showAnalysis: true
  },

  onLoad(query) {
    const app = getApp();
    const fallbackConfig = app.globalData.lastPracticeConfig || null;
    const resolvedQuery = Object.keys(query || {}).length ? query : (fallbackConfig || {});
    const totalQuestions = Number(resolvedQuery.total || 0);
    const maxQuestionCount = Math.max(1, totalQuestions || 1);
    const countOptions = Array.from({ length: maxQuestionCount }, (_, index) => index + 1);
    const preferredCount = Math.min(
      Math.max(1, Number(resolvedQuery.selectedCount || 10)),
      maxQuestionCount
    );
    this.setData({
      title: decodeURIComponent(resolvedQuery.title || ''),
      bankId: resolvedQuery.bankId || '',
      chapterKey: decodeURIComponent(resolvedQuery.chapterKey || ''),
      bankName: decodeURIComponent(resolvedQuery.bankName || ''),
      totalQuestions,
      countOptions,
      selectedCount: preferredCount,
      selectedCountIndex: preferredCount - 1,
      showAnalysis: resolvedQuery.showAnalysis !== false && resolvedQuery.showAnalysis !== 'false'
    });
  },

  changeCount(e) {
    const selectedCountIndex = Number(e.detail.value || 0);
    const selectedCount = this.data.countOptions[selectedCountIndex] || 1;
    this.setData({ selectedCountIndex, selectedCount });
  },

  toggleAnalysis(e) {
    this.setData({ showAnalysis: e.detail.value });
  },

  start() {
    const { bankId, chapterKey, selectedCount, title, bankName, order, showAnalysis } = this.data;
    getApp().globalData.lastPracticeConfig = {
      bankId,
      chapterKey,
      selectedCount,
      title,
      bankName,
      total: this.data.totalQuestions,
      showAnalysis
    };
    wx.navigateTo({
      url: `/pages/practice/answer?bankId=${bankId}&chapterKey=${encodeURIComponent(chapterKey || '')}&count=${selectedCount}&title=${encodeURIComponent(title || '')}&bankName=${encodeURIComponent(bankName || '')}&order=${encodeURIComponent(order)}&total=${this.data.totalQuestions || 0}&showAnalysis=${showAnalysis}`
    });
  }
});
