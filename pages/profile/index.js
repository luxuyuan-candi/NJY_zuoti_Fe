const { ensureIdentity, getRanking, getMedals } = require('../../utils/services');

const BASE_TOOLS = [
  { name: '意见反馈', url: '/pages/feedback/index' }
];

const MANAGER_TOOL = { name: '人员管理', url: '/pages/admin/users/index' };
const NOTICE_TOOL = { name: '公告配置', url: '/pages/admin/notice/index' };
const FEEDBACK_TOOL = { name: '反馈列表', url: '/pages/admin/feedback/index' };
const TOOL_ICON_FALLBACKS = [
  '/assets/designs/ui-refresh/icon-record.png',
  '/assets/designs/ui-refresh/icon-bank.png',
  '/assets/designs/ui-refresh/icon-notebook.png',
  '/assets/designs/ui-refresh/icon-profile.png'
];

Page({
  data: {
    user: {},
    displayName: '匿名',
    tools: BASE_TOOLS,
    medals: [],
    ranking: [
      { label: '总榜', value: '--' },
      { label: '周榜', value: '--' },
      { label: '积分', value: '0' }
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
            { label: '积分', value: String(ranking.currentScore || 0) }
          ]
        });
      })
      .catch(() => {});

    return getMedals()
      .then((medals) => {
        const preview = (medals || [])
          .filter((item) => item && item.achieved)
          .slice(0, 3);
        this.setData({ medals: preview.length ? preview.map((item) => item.name) : ['继续加油'] });
      })
      .catch(() => {});
  },

  applyUser(user) {
    const role = user.role || 'USER';
    const canManageUsers = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const canManageNotice = role === 'SUPER_ADMIN';
    const tools = [];

    if (canManageUsers) {
      tools.push(MANAGER_TOOL);
    }
    if (canManageNotice) {
      tools.push(NOTICE_TOOL);
      tools.push(FEEDBACK_TOOL);
    }
    tools.push(...BASE_TOOLS);

    this.setData({
      user: {
        ...user,
        roleLabel: user.roleLabel || this.roleLabel(role)
      },
      displayName: user.nickname || '匿名',
      tools: this.decorateTools(tools)
    });
  },

  decorateTools(tools) {
    return (tools || []).map((item, index) => ({
      ...item,
      iconUrl: TOOL_ICON_FALLBACKS[index % TOOL_ICON_FALLBACKS.length]
    }));
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
