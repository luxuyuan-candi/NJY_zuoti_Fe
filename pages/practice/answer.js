const { question } = require('../../utils/mock');

Page({
  data: {
    question,
    selected: '',
    submitted: false,
    favorited: false,
    showNavigator: false,
    navNumbers: Array.from({ length: 20 }, (_, index) => index + 1)
  },

  selectOption(e) {
    if (this.data.submitted) return;
    this.setData({ selected: e.currentTarget.dataset.key });
  },

  submit() {
    if (!this.data.selected) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    this.setData({ submitted: true });
  },

  toggleFavorite() {
    this.setData({ favorited: !this.data.favorited });
  },

  toggleNavigator() {
    this.setData({ showNavigator: !this.data.showNavigator });
  },

  finish() {
    wx.navigateTo({ url: '/pages/practice/result' });
  }
});
