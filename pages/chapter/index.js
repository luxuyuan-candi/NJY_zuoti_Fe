const { getChapters } = require('../../utils/services');

Page({
  data: {
    bankId: 'bank-exam-1',
    chapters: [],
    modes: ['章节', '套卷', '专项'],
    activeMode: '章节'
  },

  onLoad(query) {
    const bankId = query.id || 'bank-exam-1';
    this.setData({ bankId });
    getChapters(bankId)
      .then((chapters) => this.setData({ chapters }))
      .catch(() => wx.showToast({ title: '请先登录并等待授权', icon: 'none' }));
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
    wx.navigateTo({ url: `/pages/practice/settings?chapterId=${e.currentTarget.dataset.id || ''}` });
  },

  cacheChapter() {
    wx.showToast({ title: '缓存任务已创建', icon: 'none' });
  }
});
