const { getMistakes, removeMistake, removeAllMistakes } = require('../../utils/services');

Page({
  data: {
    title: '错题本',
    subtitle: '展示你累计做错过的题目和做错次数。',
    mistakes: [],
    recordId: '',
    recordMode: false,
    loading: true
  },

  onLoad(query) {
    this.setData({
      recordId: query.recordId || '',
      recordMode: !!query.recordId,
      title: query.recordId ? '本次错题' : '错题本',
      subtitle: query.recordId
        ? '这里只展示本次完成记录中做错的题目。'
        : '展示你累计做错过的题目和做错次数。'
    });
  },

  onShow() {
    this.setData({ loading: true });
    getMistakes(this.data.recordId)
      .then((mistakes) => this.setData({ mistakes, loading: false }))
      .catch(() => this.setData({ mistakes: [], loading: false }));
  },

  remove(e) {
    if (this.data.recordMode) {
      return;
    }
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '开始移除', icon: 'loading', duration: 800 });
    removeMistake(id)
      .then((mistakes) => {
        this.setData({ mistakes });
        wx.showToast({ title: '已移出错题本', icon: 'success' });
      })
      .catch(() => wx.showToast({ title: '移出失败', icon: 'none' }));
  },

  removeAll() {
    if (this.data.recordMode || !this.data.mistakes.length) {
      return;
    }
    wx.showModal({
      title: '确认移除',
      content: '确定要移除当前错题本中的全部错题吗？',
      success: ({ confirm }) => {
        if (!confirm) {
          return;
        }
        wx.showToast({ title: '开始移除', icon: 'loading', duration: 800 });
        removeAllMistakes()
          .then((result) => {
            this.setData({ mistakes: [] });
            wx.showToast({
              title: result && result.removedCount ? `已移除 ${result.removedCount} 题` : '已全部移除',
              icon: 'success'
            });
          })
          .catch(() => wx.showToast({ title: '移除失败', icon: 'none' }));
      }
    });
  },

  practice() {
    if (this.data.recordMode) {
      return;
    }
    getApp().globalData.currentMistakeSet = this.data.mistakes || [];
    wx.navigateTo({ url: '/pages/practice/settings?source=mistake' });
  },

  openDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }
    const mode = this.data.recordMode ? 'record' : 'global';
    wx.navigateTo({ url: `/pages/mistake/detail?id=${id}&mode=${mode}` });
  }
});
