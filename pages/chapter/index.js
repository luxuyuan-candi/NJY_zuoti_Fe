const { chapters } = require('../../utils/mock');

Page({
  data: {
    chapters,
    modes: ['章节', '套卷', '专项'],
    activeMode: '章节'
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
