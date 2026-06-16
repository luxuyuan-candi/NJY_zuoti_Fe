const { getMistakes, removeMistake } = require('../../utils/services');

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
    removeMistake(id)
      .then((mistakes) => {
        this.setData({ mistakes });
        wx.showToast({ title: '已移出错题本', icon: 'success' });
      })
      .catch(() => wx.showToast({ title: '移出失败', icon: 'none' }));
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
