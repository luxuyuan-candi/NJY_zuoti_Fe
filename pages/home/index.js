const { getHomeContent } = require('../../utils/services');
const { assetUrl } = require('../../utils/assets');

Page({
  data: {
    video: {
      title: '南检院学习导览',
      duration: '08:32',
      url: assetUrl('video/zuoti-guide.mp4'),
      coverUrl: assetUrl('images/video-cover.png')
    },
    promotions: [
      { id: 'promo-1', title: '考前高效复习指南', desc: '用章节题库定位薄弱点，配合错题复盘提高正确率。', tag: '备考方法', imageUrl: assetUrl('images/promo-review.png') },
      { id: 'promo-2', title: '课程学习巩固计划', desc: '按课程章节完成每日练习，系统自动沉淀错题和收藏题。', tag: '课程学习', imageUrl: assetUrl('images/promo-course.png') },
      { id: 'promo-3', title: '离线做题说明', desc: '授权题库支持缓存，网络不稳定时也能继续完成练习。', tag: '功能说明', imageUrl: assetUrl('images/promo-offline.png') }
    ]
  },

  onLoad() {
    getHomeContent().then((data) => {
      wx.setStorageSync('homeVideo', data.video || this.data.video);
      this.setData({
        video: data.video || this.data.video,
        promotions: data.promotions || this.data.promotions
      });
    });
  },

  goVideo() {
    wx.setStorageSync('homeVideo', this.data.video);
    wx.navigateTo({ url: '/pages/video/detail' });
  },

  goPromotion(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/promotion/detail?id=${id}` });
  },

  goNotice() {
    wx.navigateTo({ url: '/pages/notice/detail' });
  }
});
