const { startPractice, submitPracticeAnswer } = require('../../utils/services');
const { question: fallbackQuestion } = require('../../utils/mock');

Page({
  data: {
    question: fallbackQuestion,
    selected: '',
    submitted: false,
    favorited: false,
    showNavigator: false,
    navNumbers: Array.from({ length: 20 }, (_, index) => index + 1)
  },

  onLoad() {
    startPractice()
      .then((question) => this.setData({ question }))
      .catch(() => wx.showToast({ title: '请先登录并等待授权', icon: 'none' }));
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
    submitPracticeAnswer(this.data.question.id, this.data.selected)
      .then((result) => {
        this.setData({
          submitted: true,
          question: {
            ...this.data.question,
            answer: result.answer || this.data.question.answer,
            analysis: result.analysis || this.data.question.analysis
          }
        });
      })
      .catch(() => this.setData({ submitted: true }));
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
