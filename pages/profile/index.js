const { ensureIdentity, getRanking, getMedals } = require('../../utils/services');

const BASE_TOOLS = [
  { name: '反馈', url: '/pages/feedback/index' }
];

const MANAGER_TOOL = { name: '人员管理', url: '/pages/admin/users/index' };

Page({
  data: {
    user: {},
    displayName: '匿名',
    tools: BASE_TOOLS,
    medals: [],
    ranking: [
      { label: '总榜', value: '--' },
      { label: '周榜', value: '--' },
      { label: '获得积分', value: '0' }
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
            { label: '总榜', value: formatRankValue(ranking.total) },
            { label: '周榜', value: formatRankValue(ranking.weekly) },
            { label: '获得积分', value: String(ranking.currentScore || 0) }
          ]
        });
      })
      .catch(() => {});
    return getMedals()
      .then((medals) => {
        const preview = (medals || [])
          .filter((item) => item && item.achieved)
          .slice(0, 3);
        this.setData({ medals: preview.length ? preview.map((item) => item.name) : ['继续努力'] });
      })
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

function formatRankValue(value) {
  return value ? String(value) : '--';
}
