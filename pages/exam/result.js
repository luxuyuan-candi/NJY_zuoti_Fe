Page({
  data: {
    breakdown: [
      { name: '单选题', score: 42 },
      { name: '多选题', score: 28 },
      { name: '判断题', score: 22 }
    ]
  },

  review() {
    wx.navigateTo({ url: '/pages/practice/answer?readonly=1' });
  },

  retry() {
    wx.navigateTo({ url: '/pages/exam/intro' });
  }
});
