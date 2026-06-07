const { submitFeedback } = require('../../utils/services');

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
    submitFeedback(this.data.content)
      .then(() => {
        wx.showToast({ title: '已提交', icon: 'success' });
        this.setData({ content: '' });
      })
      .catch(() => wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' }));
  }
});
