const { assetUrl } = require('../../utils/assets');

Page({
  data: {
    video: {
      title: '南检院学习导览',
      duration: '08:32',
      url: assetUrl('video/zuoti-guide.mp4'),
      coverUrl: assetUrl('images/video-cover.png')
    }
  },

  onLoad() {
    const video = wx.getStorageSync('homeVideo');
    if (video) {
      this.setData({ video });
    }
  }
});
