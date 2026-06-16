const { assetUrl } = require('../../utils/assets');

Page({
  data: {
    video: {
      id: 'video-01',
      title: '首页与功能总览',
      duration: '00:16',
      url: assetUrl('video/home-video-01-guide.mp4'),
      coverUrl: assetUrl('images/home-video-01-guide.jpg'),
      desc: '概览小程序首页入口、公告区和学习内容布局。'
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
