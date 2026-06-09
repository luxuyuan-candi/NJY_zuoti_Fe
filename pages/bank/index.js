const { getBanks } = require('../../utils/services');

Page({
  data: {
    authorized: true,
    tabs: ['全部', '初级', '中级', '高级'],
    activeTab: '全部',
    keyword: '',
    banks: [],
    visibleBanks: [],
    loading: false
  },

  onShow() {
    this.loadBanks();
  },

  loadBanks() {
    this.setData({ loading: true });
    getBanks()
      .then((banks) => {
        this.setData({ banks, authorized: true }, () => this.applyFilters());
      })
      .catch(() => this.setData({ authorized: false }))
      .finally(() => this.setData({ loading: false }));
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab;
    this.setData({ activeTab });
    this.applyFilters();
  },

  updateKeyword(e) {
    this.setData({ keyword: (e.detail.value || '').trim() });
    this.applyFilters();
  },

  applyFilters() {
    const { banks, activeTab, keyword } = this.data;
    const normalizedKeyword = keyword.toLowerCase();
    const visibleBanks = banks.filter((bank) => {
      const levelMatched = activeTab === '全部' || bank.levelLabel === activeTab;
      const keywordMatched = !normalizedKeyword
        || `${bank.name} ${bank.desc} ${bank.levelLabel}`.toLowerCase().includes(normalizedKeyword);
      return levelMatched && keywordMatched;
    });
    this.setData({ visibleBanks });
  },

  goChapter(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/chapter/index?id=${id}` });
  }
});
