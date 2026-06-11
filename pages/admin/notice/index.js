const { ensureIdentity, getAdminNotice, updateAdminNotice } = require('../../../utils/services');

Page({
  data: {
    loading: true,
    saving: false,
    title: '',
    content: ''
  },

  onShow() {
    this.loadNotice();
  },

  loadNotice() {
    this.setData({ loading: true });
    ensureIdentity()
      .then((user) => {
        if (!user || user.role !== 'SUPER_ADMIN') {
          throw new Error('forbidden');
        }
        return getAdminNotice();
      })
      .then((notice) => {
        this.setData({
          loading: false,
          title: notice.title || '',
          content: notice.content || ''
        });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '无权访问公告配置', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 800);
      });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  save() {
    const { title, content, saving } = this.data;
    if (saving) {
      return;
    }
    if (!title.trim() || !content.trim()) {
      wx.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    updateAdminNotice({ title, content })
      .then((notice) => {
        wx.setStorageSync('homeNotice', notice);
        this.setData({
          saving: false,
          title: notice.title || '',
          content: notice.content || ''
        });
        wx.showToast({ title: '公告已保存', icon: 'success' });
      })
      .catch(() => {
        this.setData({ saving: false });
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
  }
});
