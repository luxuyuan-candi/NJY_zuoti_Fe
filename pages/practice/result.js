Page({
  data: {
    metrics: [
      { label: '总题数', value: '20' },
      { label: '正确', value: '16' },
      { label: '正确率', value: '80%' }
    ],
    details: [
      { name: '基础概念', accuracy: 88 },
      { name: '业务流程', accuracy: 76 },
      { name: '综合应用', accuracy: 68 }
    ]
  },

  goMistake() {
    wx.navigateTo({ url: '/pages/mistake/index' });
  },

  retry() {
    wx.navigateTo({ url: '/pages/practice/settings' });
  }
});
