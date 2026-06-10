Page({
  data: {
    source: '',
    title: '',
    bankId: '',
    chapterKey: '',
    bankName: '',
    questionIds: [],
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
    const source = resolvedQuery.source || '';
    if (source === 'mistake') {
      const mistakeItems = app.globalData.currentMistakeSet || [];
      const questionIds = mistakeItems.map((item) => item.questionId).filter(Boolean);
      const totalQuestions = questionIds.length;
      const maxQuestionCount = Math.max(1, totalQuestions || 1);
      const countOptions = Array.from({ length: maxQuestionCount }, (_, index) => index + 1);
      const preferredCount = Math.min(
        Math.max(1, Number(resolvedQuery.selectedCount || totalQuestions || 1)),
        maxQuestionCount
      );
      this.setData({
        source,
        title: '错题重做',
        bankId: '',
        chapterKey: '',
        bankName: '',
        questionIds,
        totalQuestions,
        countOptions,
        selectedCount: preferredCount,
        selectedCountIndex: preferredCount - 1,
        showAnalysis: resolvedQuery.showAnalysis !== false && resolvedQuery.showAnalysis !== 'false'
      });
      if (!totalQuestions) {
        wx.showToast({ title: '当前错题本没有题目', icon: 'none' });
      }
      return;
    }

    const totalQuestions = Number(resolvedQuery.total || 0);
    const maxQuestionCount = Math.max(1, totalQuestions || 1);
    const countOptions = Array.from({ length: maxQuestionCount }, (_, index) => index + 1);
    const preferredCount = Math.min(
      Math.max(1, Number(resolvedQuery.selectedCount || 10)),
      maxQuestionCount
    );
    this.setData({
      source,
      title: decodeURIComponent(resolvedQuery.title || ''),
      bankId: resolvedQuery.bankId || '',
      chapterKey: decodeURIComponent(resolvedQuery.chapterKey || ''),
      bankName: decodeURIComponent(resolvedQuery.bankName || ''),
      questionIds: resolvedQuery.questionIds || [],
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
    const { source, bankId, chapterKey, selectedCount, title, bankName, order, showAnalysis, questionIds } = this.data;
    if (source === 'mistake' && !questionIds.length) {
      wx.showToast({ title: '当前没有可重做的错题', icon: 'none' });
      return;
    }
    getApp().globalData.lastPracticeConfig = {
      source,
      bankId,
      chapterKey,
      questionIds,
      selectedCount,
      title,
      bankName,
      total: this.data.totalQuestions,
      showAnalysis
    };
    wx.navigateTo({
      url: `/pages/practice/answer?source=${encodeURIComponent(source || '')}&bankId=${bankId}&chapterKey=${encodeURIComponent(chapterKey || '')}&count=${selectedCount}&title=${encodeURIComponent(title || '')}&bankName=${encodeURIComponent(bankName || '')}&order=${encodeURIComponent(order)}&total=${this.data.totalQuestions || 0}&showAnalysis=${showAnalysis}`
    });
  }
});
