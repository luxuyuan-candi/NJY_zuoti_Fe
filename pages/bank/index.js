const { ensureIdentity, getBanks } = require('../../utils/services');

Page({
  data: {
    authorized: true,
    unauthorizedMessage: '游客无权查看题库，请先完成身份配置并联系管理员授权。',
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
    ensureIdentity()
      .then((user) => {
        if (user && user.role === 'GUEST') {
          this.setData({
            authorized: false,
            unauthorizedMessage: '游客无权查看题库，请先完成身份配置并联系管理员授权。',
            banks: [],
            visibleBanks: []
          });
          return null;
        }
        return getBanks();
      })
      .then((banks) => {
        if (!banks) return;
        this.setData({ banks, authorized: true }, () => this.applyFilters());
      })
      .catch((error) => {
        const unauthorized = error && (error.statusCode === 401 || error.statusCode === 403 || error.detail);
        this.setData({
          authorized: false,
          unauthorizedMessage: unauthorized
            ? '游客无权查看题库，请先完成身份配置并联系管理员授权。'
            : '题库暂时不可用，请稍后重试。'
        });
      })
      .finally(() => this.setData({ loading: false }));
  },

  updateKeyword(e) {
    this.setData({ keyword: (e.detail.value || '').trim() });
    this.applyFilters();
  },

  applyFilters() {
    const { banks, keyword } = this.data;
    const normalizedKeyword = keyword.toLowerCase();
    const visibleBanks = banks.filter((bank) => {
      const keywordMatched = !normalizedKeyword
        || `${bank.name} ${bank.desc} ${bank.levelLabel} ${bank.type}`.toLowerCase().includes(normalizedKeyword);
      return keywordMatched;
    });
    this.setData({ visibleBanks });
  },

  goChapter(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/chapter/index?id=${id}` });
  }
});
