const { getHomeContent } = require('../../utils/services');
const { assetUrl } = require('../../utils/assets');

const EBOOK_CACHE_KEY = 'ebookPromotionCacheMap';
const HERO_COVER = '/assets/designs/ui-refresh/hero-study-cover.jpg';
const PROMO_ICON_MAP = {
  pdf: '/assets/designs/ui-refresh/icon-pdf.png',
  notebook: '/assets/designs/ui-refresh/icon-notebook.png',
  checklist: '/assets/designs/ui-refresh/icon-checklist.png',
  play: '/assets/designs/ui-refresh/icon-play.png'
};
const SHORTCUTS = [
  { key: 'daily', label: '每日一练', iconUrl: '/assets/designs/ui-refresh/icon-record.png', url: '/pages/bank/index', mode: 'switchTab' },
  { key: 'chapter', label: '章节练习', iconUrl: '/assets/designs/ui-refresh/icon-bank.png', url: '/pages/bank/index', mode: 'switchTab' },
  { key: 'mistake', label: '错题本', iconUrl: '/assets/designs/ui-refresh/icon-notebook.png', url: '/pages/mistake/index', mode: 'navigate' },
  { key: 'favorite', label: '收藏夹', iconUrl: '/assets/designs/ui-refresh/icon-profile.png', url: '/pages/favorite/index', mode: 'navigate' }
];
const VIDEO_VISUALS = [
  {
    title: '教育学核心考点精讲',
    subtitle: '第3章 教育与社会发展',
    teacher: '主讲：张老师',
    duration: '23:45',
    progressText: '已学 36%'
  },
  {
    title: '题库练习与结果查看',
    subtitle: '浏览题库入口、做题流程和练习结果页面内容。',
    teacher: '主讲：李老师',
    duration: '18:20',
    progressText: '已学 18%'
  },
  {
    title: '备考路径与资料导学',
    subtitle: '资料、错题、记录联动',
    teacher: '主讲：王老师',
    duration: '16:10',
    progressText: '已学 52%'
  }
];
const PROMOTION_VISUALS = [
  { title: '考点精编讲义', desc: '高频考点整理', summary: '共 128 页', iconUrl: PROMO_ICON_MAP.pdf },
  { title: '历年真题汇编', desc: '近5年真题精选', summary: '共 35 套', iconUrl: PROMO_ICON_MAP.notebook },
  { title: '模拟试题', desc: '全真模拟演练', summary: '共 20 套', iconUrl: PROMO_ICON_MAP.checklist },
  { title: '备考视频课', desc: '名师系统讲解', summary: '共 56 课时', iconUrl: PROMO_ICON_MAP.play }
];

Page({
  data: {
    notice: {
      id: 'notice-1',
      title: '题库授权说明',
      content: '用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。',
      marqueeText: '2025年上半年教师资格证考试报名将于4月12日开始'
    },
    video: {
      id: 'video-01',
      ...VIDEO_VISUALS[0],
      url: assetUrl('video/home-video-01-guide.mp4'),
      coverUrl: HERO_COVER,
      desc: '高频考点梳理'
    },
    videos: [
      {
        id: 'video-01',
        ...VIDEO_VISUALS[0],
        url: assetUrl('video/home-video-01-guide.mp4'),
        coverUrl: HERO_COVER,
        desc: '高频考点梳理'
      },
      {
        id: 'video-02',
        ...VIDEO_VISUALS[1],
        url: assetUrl('video/home-video-02-practice.mp4'),
        coverUrl: HERO_COVER,
        desc: '模拟实战讲解'
      },
      {
        id: 'video-03',
        ...VIDEO_VISUALS[2],
        url: assetUrl('video/home-video-03-ebook.mp4'),
        coverUrl: HERO_COVER,
        desc: '资料使用说明'
      }
    ],
    promotions: [
      {
        id: 'ebook-01',
        ...PROMOTION_VISUALS[0],
        tag: '电子教材',
        fileType: 'pdf',
        fileName: '1_医药商品购销员基础知识.pdf',
        fileUrl: assetUrl('docs/ebooks/ebook-01-basic-knowledge.pdf')
      },
      {
        id: 'ebook-02',
        ...PROMOTION_VISUALS[1],
        tag: '电子教材',
        fileType: 'pdf',
        fileName: '1_医药商品购销员初级.pdf',
        fileUrl: assetUrl('docs/ebooks/ebook-02-primary.pdf')
      },
      {
        id: 'ebook-03',
        ...PROMOTION_VISUALS[2],
        tag: '习题教材',
        fileType: 'pdf',
        fileName: '1_医药商品购销员综合训练题集.pdf',
        fileUrl: assetUrl('docs/ebooks/ebook-03-workbook.pdf')
      },
      {
        id: 'ebook-04',
        ...PROMOTION_VISUALS[3],
        tag: '视频资料',
        fileType: 'pdf',
        fileName: '医药商品购销员中级.pdf',
        fileUrl: assetUrl('docs/ebooks/ebook-04-intermediate.pdf')
      }
    ],
    shortcuts: SHORTCUTS,
    cacheMap: {},
    cacheProgressMap: {}
  },

  onLoad() {
    const cacheMap = this.loadCacheMap();
    this.setData({ cacheMap });

    getHomeContent()
      .then((data) => {
        const notice = (data.notices || [])[0] || this.data.notice;
        const videos = this.decorateVideos(data.videos || (data.video ? [data.video] : this.data.videos));
        const promotions = this.decoratePromotions(data.promotions || this.data.promotions);
        wx.setStorageSync('homeNotice', notice);
        wx.setStorageSync('homeVideo', videos[0] || this.data.video);
        this.setData({
          notice: {
            ...this.data.notice,
            ...notice,
            marqueeText: notice.marqueeText || notice.title || this.data.notice.marqueeText
          },
          video: videos[0] || this.data.video,
          videos,
          promotions,
          cacheMap: this.reconcileCacheMap(promotions, cacheMap)
        });
      })
      .catch(() => {});
  },

  decorateVideos(videos) {
    return (videos || []).map((item, index) => ({
      ...item,
      ...VIDEO_VISUALS[index % VIDEO_VISUALS.length],
      coverUrl: item.coverUrl || HERO_COVER
    }));
  },

  decoratePromotions(promotions) {
    return (promotions || []).slice(0, 4).map((item, index) => ({
      ...item,
      ...PROMOTION_VISUALS[index % PROMOTION_VISUALS.length],
      iconUrl: this.getPromotionIcon(item, index) || PROMOTION_VISUALS[index % PROMOTION_VISUALS.length].iconUrl
    }));
  },

  getPromotionIcon(item, index) {
    const fallback = PROMOTION_VISUALS[index % PROMOTION_VISUALS.length];
    if (fallback && fallback.iconUrl) {
      return fallback.iconUrl;
    }
    if (item.fileType === 'pdf') {
      return PROMO_ICON_MAP.pdf;
    }
    const title = `${item.title || ''} ${item.tag || ''}`;
    if (title.includes('视频')) {
      return PROMO_ICON_MAP.play;
    }
    if (title.includes('题') || title.includes('练')) {
      return PROMO_ICON_MAP.checklist;
    }
    return index % 2 === 0 ? PROMO_ICON_MAP.notebook : PROMO_ICON_MAP.pdf;
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

  openShortcut(e) {
    const { url, mode } = e.currentTarget.dataset;
    if (!url) {
      return;
    }
    if (mode === 'switchTab') {
      wx.switchTab({ url });
      return;
    }
    wx.navigateTo({ url });
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
            this.setData({ cacheMap: nextCacheMap });
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
