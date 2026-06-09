const { getPracticeTrends } = require('../../utils/services');

Page({
  data: {
    trends: []
  },

  onShow() {
    getPracticeTrends()
      .then((trends) => this.setData({ trends }))
      .catch(() => this.setData({ trends: [] }));
  }
});
