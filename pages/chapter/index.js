const { getChapters } = require('../../utils/services');

Page({
  data: {
    bankId: '',
    bank: null,
    chapters: [],
    modes: ['章节', '套卷', '专项'],
    activeMode: '章节',
    loading: false
  },

  onLoad(query) {
    const bankId = query.id || '';
    this.setData({ bankId, loading: true });
    getChapters(bankId)
      .then((data) => this.setData({
        bank: data.bank || null,
        chapters: data.chapters || [],
        loading: false
      }))
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '请先登录并等待授权', icon: 'none' });
      });
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === '套卷') {
      wx.navigateTo({ url: '/pages/paper/index' });
      return;
    }
    this.setData({ activeMode: mode });
  },

  goSettings(e) {
    const { id, title, total } = e.currentTarget.dataset;
    const { bankId, bank } = this.data;
    wx.navigateTo({
      url: `/pages/practice/settings?bankId=${bankId}&chapterKey=${encodeURIComponent(id || '')}&title=${encodeURIComponent(title || '')}&total=${total || 0}&bankName=${encodeURIComponent((bank && bank.name) || '')}`
    });
  },

  cacheChapter() {
    wx.showToast({ title: '缓存任务已创建', icon: 'none' });
  },

  startFullBankPractice() {
    const { bankId, bank } = this.data;
    wx.navigateTo({
      url: `/pages/practice/settings?bankId=${bankId}&title=${encodeURIComponent((bank && bank.name) || '')}&total=${(bank && bank.questionCount) || 0}&bankName=${encodeURIComponent((bank && bank.name) || '')}`
    });
  }
});
