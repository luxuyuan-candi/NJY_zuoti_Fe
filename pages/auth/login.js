const { ensureIdentity, updateUserProfile } = require('../../utils/services');

Page({
  data: {
    avatarUrl: '',
    avatarBase64: '',
    avatarContentType: 'image/jpeg',
    avatarExt: 'jpg',
    nickname: '',
    email: '',
    saving: false
  },

  onLoad() {
    ensureIdentity()
      .then((user) => this.setUser(user))
      .catch(() => {
        wx.showToast({ title: '身份获取失败', icon: 'none' });
      });
  },

  setUser(user) {
    if (!user) return;
    this.setData({
      avatarUrl: user.avatarUrl || '',
      nickname: user.nickname || '',
      email: user.email || ''
    });
  },

  chooseAvatarAction() {
    wx.showActionSheet({
      itemList: ['选图片', '拍照', '微信头像'],
      success: ({ tapIndex }) => {
        if (tapIndex === 0) {
          this.chooseLocalAvatar(['album']);
          return;
        }
        if (tapIndex === 1) {
          this.chooseLocalAvatar(['camera']);
          return;
        }
        this.chooseWechatAvatar();
      }
    });
  },

  chooseWechatAvatar() {
    wx.getUserProfile({
      desc: '用于获取微信头像',
      success: ({ userInfo }) => {
        const avatarUrl = userInfo && userInfo.avatarUrl;
        if (!avatarUrl) {
          return;
        }
        wx.downloadFile({
          url: avatarUrl,
          success: ({ tempFilePath }) => {
            if (tempFilePath) {
              this.useAvatarFile(tempFilePath);
            }
          },
          fail: () => {
            wx.showToast({ title: '微信头像获取失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '微信头像获取失败', icon: 'none' });
      }
    });
  },

  chooseLocalAvatar(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (file && file.tempFilePath) {
          this.useAvatarFile(file.tempFilePath);
        }
      }
    });
  },

  useAvatarFile(filePath) {
    const ext = this.resolveExt(filePath);
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: ({ data }) => {
        this.setData({
          avatarUrl: filePath,
          avatarBase64: data,
          avatarExt: ext,
          avatarContentType: ext === 'png' ? 'image/png' : 'image/jpeg'
        });
      },
      fail: () => {
        this.setData({ avatarUrl: filePath, avatarBase64: '' });
      }
    });
  },

  resolveExt(filePath) {
    const match = String(filePath).toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
    const ext = match ? match[1] : 'jpg';
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value });
  },

  saveProfile() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    updateUserProfile({
      nickname: this.data.nickname.trim(),
      email: this.data.email.trim(),
      avatar_url: this.data.avatarBase64 ? '' : this.data.avatarUrl,
      avatar_base64: this.data.avatarBase64,
      avatar_content_type: this.data.avatarContentType,
      avatar_ext: this.data.avatarExt
    })
      .then((user) => {
        this.setUser(user);
        wx.showToast({ title: '已保存', icon: 'success' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 500);
      })
      .catch(() => {
        wx.showToast({ title: '保存失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ saving: false });
      });
  }
});
