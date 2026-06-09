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
    const totalQuestions = Number(query.total || 0);
    const counts = [10, 20, 30, 50].filter((count) => count <= totalQuestions);
    const resolvedCounts = counts.length ? counts : [Math.max(1, totalQuestions || 10)];
    this.setData({
      title: decodeURIComponent(query.title || ''),
      bankId: query.bankId || '',
      chapterKey: decodeURIComponent(query.chapterKey || ''),
      bankName: decodeURIComponent(query.bankName || ''),
      totalQuestions,
      counts: resolvedCounts,
      selectedCount: resolvedCounts[0]
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
    wx.navigateTo({
      url: `/pages/practice/answer?bankId=${bankId}&chapterKey=${encodeURIComponent(chapterKey || '')}&count=${selectedCount}&title=${encodeURIComponent(title || '')}&bankName=${encodeURIComponent(bankName || '')}&order=${encodeURIComponent(order)}`
    });
  }
});
