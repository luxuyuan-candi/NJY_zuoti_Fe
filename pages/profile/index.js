const { ensureIdentity, getRanking, getMedals } = require('../../utils/services');

const BASE_TOOLS = [
  { name: '身份配置', url: '/pages/auth/login' },
  { name: '反馈', url: '/pages/feedback/index' },
  { name: '设置', url: '/pages/settings/index' },
  { name: '协议', url: '/pages/agreement/index' }
];

const MANAGER_TOOL = { name: '人员管理', url: '/pages/admin/users/index' };

Page({
  data: {
    user: {},
    displayName: '匿名',
    tools: BASE_TOOLS,
    medals: ['连续学习', '考试达人', '错题清零'],
    ranking: [
      { label: '总榜', value: '128' },
      { label: '周榜', value: '16' },
      { label: '当前积分', value: '2680' }
    ]
  },

  onShow() {
    const user = wx.getStorageSync('user');
    if (user) {
      this.applyUser(user);
    }
    ensureIdentity()
      .then((currentUser) => {
        if (currentUser) {
          this.applyUser(currentUser);
        }
        return this.loadAssets();
      })
      .catch(() => {});
  },

  loadAssets() {
    getRanking()
      .then((ranking) => {
        this.setData({
          ranking: [
            { label: '总榜', value: String(ranking.total || 0) },
            { label: '周榜', value: String(ranking.weekly || 0) },
            { label: '当前积分', value: String(ranking.currentScore || 0) }
          ]
        });
      })
      .catch(() => {});
    return getMedals()
      .then((medals) => this.setData({ medals: medals.map((item) => item.name || item) }))
      .catch(() => {});
  },

  applyUser(user) {
    const role = user.role || 'USER';
    const canManageUsers = role === 'ADMIN' || role === 'SUPER_ADMIN';
    this.setData({
      user: {
        ...user,
        roleLabel: user.roleLabel || this.roleLabel(role)
      },
      displayName: user.nickname || '匿名',
      tools: canManageUsers ? [MANAGER_TOOL, ...BASE_TOOLS] : BASE_TOOLS
    });
  },

  roleLabel(role) {
    return {
      GUEST: '游客',
      USER: '普通用户',
      ADMIN: '管理员',
      SUPER_ADMIN: '超级管理员'
    }[role] || '普通用户';
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
