const {
  getMistakeDetail,
  getRecordMistakeDetail
} = require('../../utils/services');

Page({
  data: {
    title: '',
    subtitle: '',
    question: null,
    loading: true,
    mode: 'global'
  },

  onLoad(query) {
    this.setData({
      mode: query.mode || 'global'
    });
    this.loadDetail(query.id || '', query.mode || 'global');
  },

  loadDetail(id, mode) {
    if (!id) {
      this.setData({ loading: false });
      wx.showToast({ title: '错题不存在', icon: 'none' });
      return;
    }
    const loader = mode === 'record' ? getRecordMistakeDetail(id) : getMistakeDetail(id);
    loader
      .then((detail) => {
        this.setData({
          title: mode === 'record' ? '本次错题详情' : '错题详情',
          subtitle: detail.chapter || '练习题',
          question: detail,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '加载详情失败', icon: 'none' });
      });
  }
});
