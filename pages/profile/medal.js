const { getMedals } = require('../../utils/services');

Page({
  data: {
    medals: []
  },

  onShow() {
    getMedals().then((medals) => this.setData({ medals })).catch(() => {});
  }
});
