Page({
  data: {
    content: ''
  },

  input(e) {
    this.setData({ content: e.detail.value });
  },

  submit() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    wx.showToast({ title: '已提交', icon: 'success' });
    this.setData({ content: '' });
  }
});
