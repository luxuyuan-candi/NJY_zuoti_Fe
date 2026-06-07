Page({
  data: {
    loggedIn: false,
    medals: ['连续学习', '考试达人', '错题清零'],
    ranking: [
      { label: '总榜', value: '128' },
      { label: '周榜', value: '16' },
      { label: '当前积分', value: '2680' }
    ],
    tools: [
      { name: '反馈', url: '/pages/feedback/index' },
      { name: '设置', url: '/pages/settings/index' },
      { name: '协议', url: '/pages/agreement/index' }
    ]
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/auth/login' });
  },

  goMedal() {
    wx.navigateTo({ url: '/pages/profile/medal' });
  },

  goRanking() {
    wx.navigateTo({ url: '/pages/profile/ranking' });
  },

  goTool(e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url });
  }
});
