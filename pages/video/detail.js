const { assetUrl } = require('../../utils/assets');

Page({
  data: {
    video: {
      id: 'video-01',
      title: '题库练习导览',
      duration: '00:16',
      url: assetUrl('video/home-video-01-guide.mp4'),
      coverUrl: assetUrl('images/home-video-01-guide.jpg'),
      desc: '快速了解题库、章节和随机练习的使用路径。'
    },
    videos: []
  },

  onLoad(query) {
    const currentVideo = wx.getStorageSync('homeVideo');
    const videos = wx.getStorageSync('homeVideos') || [];
    const selected = (videos || []).find((item) => item.id === (query.id || '')) || currentVideo;
    if (selected) {
      this.setData({
        video: selected,
        videos
      });
    }
  }
});
