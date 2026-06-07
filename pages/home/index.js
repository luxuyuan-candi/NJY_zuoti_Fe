Page({
  data: {
    promotions: [
      { id: 'promo-1', title: '考前高效复习指南', desc: '用章节题库定位薄弱点，配合错题复盘提高正确率。', tag: '备考方法' },
      { id: 'promo-2', title: '课程学习巩固计划', desc: '按课程章节完成每日练习，系统自动沉淀错题和收藏题。', tag: '课程学习' },
      { id: 'promo-3', title: '离线做题说明', desc: '授权题库支持缓存，网络不稳定时也能继续完成练习。', tag: '功能说明' }
    ]
  },

  goVideo() {
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
