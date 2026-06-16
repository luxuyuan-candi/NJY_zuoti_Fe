const { getHomeContent } = require('../../utils/services');
const { assetUrl } = require('../../utils/assets');

Page({
  data: {
    notice: {
      id: 'notice-1',
      title: '题库授权说明',
      content: '用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。',
      marqueeText: '题库授权说明：用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。'
    },
    video: {
      title: '南检院学习导览',
      duration: '08:32',
      url: assetUrl('video/zuoti-guide.mp4'),
      coverUrl: assetUrl('images/video-cover.png')
    },
    promotions: [
      { id: 'ebook-01', title: '医药商品购销员基础知识', desc: '基础理论电子教材，适合入门复习与概念梳理。', tag: '电子教材', fileType: 'pdf', fileName: '1_医药商品购销员-基础知识.pdf', fileUrl: assetUrl('docs/ebooks/ebook-01-basic-knowledge.pdf') },
      { id: 'ebook-02', title: '医药商品购销员初级', desc: '初级岗位电子教材，覆盖基础业务知识与实务内容。', tag: '电子教材', fileType: 'pdf', fileName: '1_医药商品购销员-初级.pdf', fileUrl: assetUrl('docs/ebooks/ebook-02-primary.pdf') },
      { id: 'ebook-03', title: '医药商品购销员综合训练习题集', desc: '配套习题教材，适合章节练习后的巩固训练。', tag: '习题教材', fileType: 'pdf', fileName: '1_医药商品购销员职业资格知识与技能综合训练-习题集.pdf', fileUrl: assetUrl('docs/ebooks/ebook-03-workbook.pdf') },
      { id: 'ebook-04', title: '医药商品购销员中级', desc: '中级电子教材，适合进阶业务学习与考前梳理。', tag: '电子教材', fileType: 'pdf', fileName: '医药商品购销员（中级）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-04-intermediate.pdf') },
      { id: 'ebook-05', title: '医药商品购销员指南包课程包', desc: '配套课程指南教材，便于按模块进行系统化学习。', tag: '课程资料', fileType: 'pdf', fileName: '医药商品购销员（指南包 课程包）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-05-guide-course-pack.pdf') },
      { id: 'ebook-06', title: '医药商品购销员高级', desc: '高级电子教材，适合高阶岗位知识学习和综合复盘。', tag: '电子教材', fileType: 'pdf', fileName: '医药商品购销员（高级）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-06-advanced.pdf') },
      { id: 'ebook-07', title: '药品购销技术', desc: '面向药品购销场景的专题教材，可作为业务拓展阅读。', tag: '专题教材', fileType: 'pdf', fileName: '药品购销技术.pdf', fileUrl: assetUrl('docs/ebooks/ebook-07-pharma-sales-technique.pdf') }
    ]
  },

  onLoad() {
    getHomeContent().then((data) => {
      const notice = (data.notices || [])[0] || this.data.notice;
      wx.setStorageSync('homeNotice', notice);
      wx.setStorageSync('homeVideo', data.video || this.data.video);
      this.setData({
        notice,
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
    const promotion = (this.data.promotions || []).find((item) => item.id === id);
    if (!promotion) {
      wx.showToast({ title: '教材不存在', icon: 'none' });
      return;
    }
    if (promotion.fileUrl) {
      this.openPromotionFile(promotion);
      return;
    }
    wx.navigateTo({ url: `/pages/promotion/detail?id=${id}` });
  },

  openPromotionFile(promotion) {
    wx.showLoading({ title: '打开教材中' });
    wx.downloadFile({
      url: promotion.fileUrl,
      success: ({ statusCode, tempFilePath }) => {
        if (statusCode < 200 || statusCode >= 300 || !tempFilePath) {
          wx.hideLoading();
          wx.showToast({ title: '教材加载失败', icon: 'none' });
          return;
        }
        wx.openDocument({
          filePath: tempFilePath,
          fileType: promotion.fileType || 'pdf',
          showMenu: true,
          success: () => wx.hideLoading(),
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '教材打开失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '教材下载失败', icon: 'none' });
      }
    });
  },

  goNotice() {
    wx.navigateTo({ url: '/pages/notice/detail' });
  }
});
