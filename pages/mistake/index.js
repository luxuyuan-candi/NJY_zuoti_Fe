const { getMistakes, removeMistake } = require('../../utils/services');

Page({
  data: {
    title: '错题本',
    subtitle: '展示你累计做错过的题目和做错次数。',
    mistakes: [],
    recordId: '',
    recordMode: false
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
    getMistakes(this.data.recordId)
      .then((mistakes) => this.setData({ mistakes }))
      .catch(() => this.setData({ mistakes: [] }));
  },

  remove(e) {
    if (this.data.recordMode) {
      return;
    }
    const id = e.currentTarget.dataset.id;
    removeMistake(id)
      .then((mistakes) => this.setData({ mistakes }))
      .catch(() => wx.showToast({ title: '移出失败', icon: 'none' }));
  },

  practice() {
    if (this.data.recordMode) {
      return;
    }
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
