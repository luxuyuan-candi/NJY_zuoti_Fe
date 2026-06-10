const { getChapters, getMistakes } = require('../../utils/services');

Page({
  data: {
    bankId: '',
    bank: null,
    chapters: [],
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

  goSettings(e) {
    const { id, title, total } = e.currentTarget.dataset;
    const { bankId, bank } = this.data;
    wx.navigateTo({
      url: `/pages/practice/settings?bankId=${bankId}&chapterKey=${encodeURIComponent(id || '')}&title=${encodeURIComponent(title || '')}&total=${total || 0}&bankName=${encodeURIComponent((bank && bank.name) || '')}`
    });
  },

  startMistakePractice() {
    getMistakes()
      .then((mistakes) => {
        if (!mistakes.length) {
          wx.showToast({ title: '当前错题本没有题目', icon: 'none' });
          return;
        }
        getApp().globalData.currentMistakeSet = mistakes;
        wx.navigateTo({ url: '/pages/practice/settings?source=mistake' });
      })
      .catch(() => wx.showToast({ title: '加载错题失败', icon: 'none' }));
  },

  startFullBankPractice() {
    const { bankId, bank } = this.data;
    wx.navigateTo({
      url: `/pages/practice/settings?bankId=${bankId}&title=${encodeURIComponent((bank && bank.name) || '')}&total=${(bank && bank.questionCount) || 0}&bankName=${encodeURIComponent((bank && bank.name) || '')}`
    });
  }
});
