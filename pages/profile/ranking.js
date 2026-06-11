const { getLeaderboard, getRanking } = require('../../utils/services');

const TABS = [
  { key: 'total', label: '总榜' },
  { key: 'weekly', label: '周榜' }
];

Page({
  data: {
    tabs: TABS,
    activeTab: 'total',
    loadingRanks: true,
    current: {
      total: null,
      weekly: null,
      currentScore: 0,
      totalAnsweredCount: 0,
      weeklyAnsweredCount: 0,
      minAnsweredCount: 100,
      eligibleTotal: false,
      eligibleWeekly: false
    },
    ranks: []
  },

  onShow() {
    this.loadCurrent();
    this.loadLeaderboard(this.data.activeTab);
  },

  loadCurrent() {
    getRanking()
      .then((current) => this.setData({ current }))
      .catch(() => {});
  },

  loadLeaderboard(scope) {
    this.setData({ loadingRanks: true });
    getLeaderboard(scope)
      .then((ranks) => this.setData({ ranks, loadingRanks: false }))
      .catch(() => this.setData({ ranks: [], loadingRanks: false }));
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeTab) {
      return;
    }
    this.setData({ activeTab: tab, ranks: [], loadingRanks: true });
    this.loadLeaderboard(tab);
  }
});
