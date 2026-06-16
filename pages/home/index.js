const { getHomeContent } = require('../../utils/services');
const { assetUrl } = require('../../utils/assets');

const EBOOK_CACHE_KEY = 'ebookPromotionCacheMap';

Page({
  data: {
    notice: {
      id: 'notice-1',
      title: '题库授权说明',
      content: '用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。',
      marqueeText: '题库授权说明：用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。'
    },
    video: {
      id: 'video-01',
      title: '题库练习导览',
      duration: '00:16',
      url: assetUrl('video/home-video-01-guide.mp4'),
      coverUrl: assetUrl('images/home-video-01-guide.jpg'),
      desc: '快速了解题库、章节和随机练习的使用路径。'
    },
    videos: [
      { id: 'video-01', title: '题库练习导览', duration: '00:16', url: assetUrl('video/home-video-01-guide.mp4'), coverUrl: assetUrl('images/home-video-01-guide.jpg'), desc: '快速了解题库、章节和随机练习的使用路径。' },
      { id: 'video-02', title: '错题复盘与记录统计', duration: '00:16', url: assetUrl('video/home-video-02-practice.mp4'), coverUrl: assetUrl('images/home-video-02-practice.jpg'), desc: '查看错题本、最近记录和趋势统计的复盘方式。' },
      { id: 'video-03', title: '教材学习与资料查看', duration: '00:15', url: assetUrl('video/home-video-03-ebook.mp4'), coverUrl: assetUrl('images/home-video-03-ebook.jpg'), desc: '在首页查看电子教材，并结合练习完成知识巩固。' }
    ],
    promotions: [
      { id: 'ebook-01', title: '医药商品购销员基础知识', desc: '基础理论电子教材，适合入门复习与概念梳理。', tag: '电子教材', fileType: 'pdf', fileName: '1_医药商品购销员-基础知识.pdf', fileUrl: assetUrl('docs/ebooks/ebook-01-basic-knowledge.pdf') },
      { id: 'ebook-02', title: '医药商品购销员初级', desc: '初级岗位电子教材，覆盖基础业务知识与实务内容。', tag: '电子教材', fileType: 'pdf', fileName: '1_医药商品购销员-初级.pdf', fileUrl: assetUrl('docs/ebooks/ebook-02-primary.pdf') },
      { id: 'ebook-03', title: '医药商品购销员综合训练习题集', desc: '配套习题教材，适合章节练习后的巩固训练。', tag: '习题教材', fileType: 'pdf', fileName: '1_医药商品购销员职业资格知识与技能综合训练-习题集.pdf', fileUrl: assetUrl('docs/ebooks/ebook-03-workbook.pdf') },
      { id: 'ebook-04', title: '医药商品购销员中级', desc: '中级电子教材，适合进阶业务学习与考前梳理。', tag: '电子教材', fileType: 'pdf', fileName: '医药商品购销员（中级）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-04-intermediate.pdf') },
      { id: 'ebook-05', title: '医药商品购销员指南包课程包', desc: '配套课程指南教材，便于按模块进行系统化学习。', tag: '课程资料', fileType: 'pdf', fileName: '医药商品购销员（指南包 课程包）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-05-guide-course-pack.pdf') },
      { id: 'ebook-06', title: '医药商品购销员高级', desc: '高级电子教材，适合高阶岗位知识学习和综合复盘。', tag: '电子教材', fileType: 'pdf', fileName: '医药商品购销员（高级）.pdf', fileUrl: assetUrl('docs/ebooks/ebook-06-advanced.pdf') },
      { id: 'ebook-07', title: '药品购销技术', desc: '面向药品购销场景的专题教材，可作为业务拓展阅读。', tag: '专题教材', fileType: 'pdf', fileName: '药品购销技术.pdf', fileUrl: assetUrl('docs/ebooks/ebook-07-pharma-sales-technique.pdf') }
    ],
    cacheMap: {},
    cacheProgressMap: {}
  },

  onLoad() {
    const cacheMap = this.loadCacheMap();
    this.setData({ cacheMap });
    getHomeContent().then((data) => {
      const notice = (data.notices || [])[0] || this.data.notice;
      wx.setStorageSync('homeNotice', notice);
      wx.setStorageSync('homeVideo', data.video || this.data.video);
      this.setData({
        notice,
        video: data.video || this.data.video,
        videos: data.videos || (data.video ? [data.video] : this.data.videos),
        promotions: data.promotions || this.data.promotions,
        cacheMap: this.reconcileCacheMap(data.promotions || this.data.promotions, cacheMap)
      });
    });
  },

  goVideo(e) {
    const { id } = (e && e.currentTarget && e.currentTarget.dataset) || {};
    const selectedVideo = (this.data.videos || []).find((item) => item.id === id) || this.data.video;
    wx.setStorageSync('homeVideo', selectedVideo);
    wx.setStorageSync('homeVideos', this.data.videos || []);
    wx.navigateTo({ url: `/pages/video/detail?id=${selectedVideo.id || ''}` });
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
    const cached = (this.data.cacheMap || {})[promotion.id];
    if (cached && cached.filePath) {
      this.openLocalDocument(promotion, cached.filePath);
      return;
    }

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

  cachePromotion(e) {
    const { id } = e.currentTarget.dataset;
    const promotion = (this.data.promotions || []).find((item) => item.id === id);
    if (!promotion || !promotion.fileUrl) {
      wx.showToast({ title: '教材不存在', icon: 'none' });
      return;
    }
    const cached = (this.data.cacheMap || {})[promotion.id];
    if (cached && cached.filePath) {
      this.openLocalDocument(promotion, cached.filePath);
      return;
    }

    const downloadTask = wx.downloadFile({
      url: promotion.fileUrl,
      success: ({ statusCode, tempFilePath }) => {
        if (statusCode < 200 || statusCode >= 300 || !tempFilePath) {
          this.clearCacheProgress(promotion.id);
          wx.showToast({ title: '教材下载失败', icon: 'none' });
          return;
        }
        wx.saveFile({
          tempFilePath,
          success: ({ savedFilePath }) => {
            const nextCacheMap = {
              ...this.data.cacheMap,
              [promotion.id]: {
                filePath: savedFilePath,
                fileName: promotion.fileName || '',
                fileUrl: promotion.fileUrl || '',
                updatedAt: Date.now()
              }
            };
            wx.setStorageSync(EBOOK_CACHE_KEY, nextCacheMap);
            this.setData({
              cacheMap: nextCacheMap
            });
            this.clearCacheProgress(promotion.id);
            wx.showToast({ title: '已缓存到本地', icon: 'success' });
          },
          fail: () => {
            this.clearCacheProgress(promotion.id);
            wx.showToast({ title: '本地空间不足', icon: 'none' });
          }
        });
      },
      fail: () => {
        this.clearCacheProgress(promotion.id);
        wx.showToast({ title: '教材下载失败', icon: 'none' });
      }
    });

    downloadTask.onProgressUpdate((progress) => {
      const nextMap = {
        ...this.data.cacheProgressMap,
        [promotion.id]: progress.progress || 0
      };
      this.setData({ cacheProgressMap: nextMap });
    });
  },

  openLocalDocument(promotion, filePath) {
    wx.openDocument({
      filePath,
      fileType: promotion.fileType || 'pdf',
      showMenu: true,
      fail: () => {
        const nextCacheMap = { ...this.data.cacheMap };
        delete nextCacheMap[promotion.id];
        wx.setStorageSync(EBOOK_CACHE_KEY, nextCacheMap);
        this.setData({ cacheMap: nextCacheMap });
        wx.showToast({ title: '本地缓存已失效', icon: 'none' });
      }
    });
  },

  loadCacheMap() {
    const cacheMap = wx.getStorageSync(EBOOK_CACHE_KEY) || {};
    const fileManager = wx.getFileSystemManager();
    const nextCacheMap = {};
    Object.keys(cacheMap).forEach((id) => {
      const item = cacheMap[id];
      if (!item || !item.filePath) {
        return;
      }
      try {
        fileManager.accessSync(item.filePath);
        nextCacheMap[id] = item;
      } catch (error) {
        return;
      }
    });
    if (Object.keys(nextCacheMap).length !== Object.keys(cacheMap).length) {
      wx.setStorageSync(EBOOK_CACHE_KEY, nextCacheMap);
    }
    return nextCacheMap;
  },

  reconcileCacheMap(promotions, cacheMap) {
    const validIds = new Set((promotions || []).map((item) => item.id));
    const nextCacheMap = {};
    Object.keys(cacheMap || {}).forEach((id) => {
      if (validIds.has(id)) {
        nextCacheMap[id] = cacheMap[id];
      }
    });
    wx.setStorageSync(EBOOK_CACHE_KEY, nextCacheMap);
    return nextCacheMap;
  },

  clearCacheProgress(id) {
    const nextMap = { ...this.data.cacheProgressMap };
    delete nextMap[id];
    this.setData({ cacheProgressMap: nextMap });
  },

  goNotice() {
    wx.navigateTo({ url: '/pages/notice/detail' });
  }
});
