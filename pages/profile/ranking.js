const { getLeaderboard, getRanking } = require('../../utils/services');

Page({
  data: {
    tabs: ['总榜', '周榜'],
    current: { total: 128, weekly: 16, currentScore: 2680 },
    ranks: [
      { name: '学习用户 A', score: 3120, rank: 1 },
      { name: '学习用户 B', score: 2980, rank: 2 },
      { name: '我', score: 2680, rank: 16 }
    ]
  },

  onLoad() {
    getRanking().then((current) => this.setData({ current })).catch(() => {});
    getLeaderboard().then((ranks) => this.setData({ ranks })).catch(() => {});
  }
});
