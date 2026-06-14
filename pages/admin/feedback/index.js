const { ensureIdentity, getAdminFeedback } = require('../../../utils/services');

Page({
  data: {
    items: [],
    loading: true
  },

  onLoad() {
    this.loadFeedback();
  },

  loadFeedback() {
    this.setData({ loading: true });
    ensureIdentity()
      .then((user) => {
        if (!user || user.role !== 'SUPER_ADMIN') {
          throw new Error('forbidden');
        }
        return getAdminFeedback();
      })
      .then((items) => {
        this.setData({
          items: (items || []).map((item) => ({
            ...item,
            displayName: item.nickname || '匿名'
          })),
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '无权查看反馈', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 800);
      });
  }
});
