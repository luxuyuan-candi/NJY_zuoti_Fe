const { ensureIdentity, getUsers, updateUserRole } = require('../../../utils/services');

const ROLE_LABELS = {
  GUEST: '游客',
  USER: '普通用户',
  ADMIN: '管理员',
  SUPER_ADMIN: '超级管理员'
};

Page({
  data: {
    currentUser: {},
    users: [],
    loading: true,
    roleOptions: []
  },

  onLoad() {
    this.loadUsers();
  },

  loadUsers() {
    this.setData({ loading: true });
    ensureIdentity()
      .then((user) => {
        const roleOptions = this.getRoleOptions(user.role);
        this.setData({ currentUser: user, roleOptions });
        return getUsers();
      })
      .then((users) => {
        this.setData({ users: this.decorateUsers(users || []), loading: false });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '无权访问人员管理', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 800);
      });
  },

  decorateUsers(users) {
    const currentOpenid = this.data.currentUser.openid;
    const currentRole = this.data.currentUser.role;
    return users.map((user) => ({
      ...user,
      displayName: user.nickname || '匿名',
      roleLabel: user.roleLabel || ROLE_LABELS[user.role] || '普通用户',
      canEditRole: this.canEditRole(currentRole, currentOpenid, user)
    }));
  },

  getRoleOptions(role) {
    if (role === 'SUPER_ADMIN') {
      return [
        { role: 'USER', label: '普通用户' },
        { role: 'ADMIN', label: '管理员' },
        { role: 'GUEST', label: '游客' }
      ];
    }
    if (role === 'ADMIN') {
      return [
        { role: 'USER', label: '普通用户' },
        { role: 'GUEST', label: '游客' }
      ];
    }
    return [];
  },

  canEditRole(currentRole, currentOpenid, targetUser) {
    if (currentOpenid === targetUser.openid) return false;
    if (currentRole === 'SUPER_ADMIN') return targetUser.role !== 'SUPER_ADMIN';
    if (currentRole === 'ADMIN') return targetUser.role === 'USER' || targetUser.role === 'GUEST';
    return false;
  },

  chooseRole(e) {
    const { openid } = e.currentTarget.dataset;
    const user = this.data.users.find((item) => item.openid === openid);
    if (!user || !user.canEditRole) return;

    const roleOptions = this.data.roleOptions;
    wx.showActionSheet({
      itemList: roleOptions.map((item) => item.label),
      success: ({ tapIndex }) => {
        const nextRole = roleOptions[tapIndex].role;
        this.saveRole(openid, nextRole);
      }
    });
  },

  saveRole(openid, role) {
    updateUserRole(openid, role)
      .then(() => {
        wx.showToast({ title: '已更新角色', icon: 'success' });
        this.loadUsers();
      })
      .catch(() => {
        wx.showToast({ title: '角色更新失败', icon: 'none' });
      });
  }
});
