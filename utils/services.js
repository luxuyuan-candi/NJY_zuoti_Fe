const { request } = require('./api');
const { assetUrl } = require('./assets');
const mock = require('./mock');

const withFallback = (promise, fallback) => promise.catch((error) => {
  if (error && (error.statusCode === 401 || error.statusCode === 403)) {
    throw error;
  }
  return fallback;
});

const normalizeQuestion = (question) => ({
  ...question,
  no: question.no || 1,
  total: question.total || 20,
  type: question.type || '',
  typeLabel: question.typeLabel || (question.type === 'single_choice' ? '单选题' : question.type === 'multiple_choice' ? '多选题' : question.type === 'true_false' ? '判断题' : '题目')
});

const loginByCode = (payload) => request({
  url: '/auth/login',
  method: 'POST',
  data: payload,
  auth: false
});

const persistIdentity = (data) => {
  const app = getApp();
  wx.setStorageSync('token', data.token);
  wx.setStorageSync('user', data.user);
  app.globalData.token = data.token;
  app.globalData.user = data.user;
  return data.user;
};

const clearIdentityCache = () => {
  const app = getApp();
  wx.removeStorageSync('token');
  wx.removeStorageSync('user');
  app.globalData.token = '';
  app.globalData.user = {
    id: '',
    openid: '',
    nickname: '',
    avatarUrl: '',
    email: '',
    role: 'GUEST',
    roleLabel: '游客',
    authorized: false
  };
};

const loginWithWxCode = () => new Promise((resolve, reject) => {
  wx.login({
    success: ({ code }) => {
      if (!code) {
        reject(new Error('missing wx login code'));
        return;
      }
      loginByCode({ code })
        .then((data) => resolve(persistIdentity(data)))
        .catch(reject);
    },
    fail: reject
  });
});

const ensureIdentity = () => {
  const token = wx.getStorageSync('token');
  if (token) {
    return getCurrentUser().catch(() => {
      clearIdentityCache();
      return loginWithWxCode();
    });
  }

  return loginWithWxCode();
};

const getCurrentUser = () => request({ url: '/user/me' }).then((user) => {
  const app = getApp();
  wx.setStorageSync('user', user);
  app.globalData.user = user;
  return user;
});

const updateUserProfile = (payload) => request({
  url: '/user/me',
  method: 'PUT',
  data: payload
}).then((user) => {
  const app = getApp();
  wx.setStorageSync('user', user);
  app.globalData.user = user;
  return user;
});

const getUsers = () => request({ url: '/users' });

const updateUserRole = (openid, role) => request({
  url: `/users/${openid}/role`,
  method: 'PUT',
  data: { role }
});

const getHomeContent = () => withFallback(
  request({ url: '/content/home', auth: false }),
  {
    video: {
      id: 'video-01',
      title: '首页与功能总览',
      duration: '00:16',
      url: assetUrl('video/home-video-01-guide.mp4'),
      coverUrl: assetUrl('images/home-video-01-guide.jpg'),
      desc: '概览小程序首页入口、公告区和学习内容布局。'
    },
    videos: [
      { id: 'video-01', title: '首页与功能总览', duration: '00:16', url: assetUrl('video/home-video-01-guide.mp4'), coverUrl: assetUrl('images/home-video-01-guide.jpg'), desc: '概览小程序首页入口、公告区和学习内容布局。' },
      { id: 'video-02', title: '题库练习与结果查看', duration: '00:16', url: assetUrl('video/home-video-02-practice.mp4'), coverUrl: assetUrl('images/home-video-02-practice.jpg'), desc: '浏览题库入口、做题流程和练习结果页面内容。' },
      { id: 'video-03', title: '教材入口与学习资料', duration: '00:15', url: assetUrl('video/home-video-03-ebook.mp4'), coverUrl: assetUrl('images/home-video-03-ebook.jpg'), desc: '查看首页电子教材入口和资料浏览方式。' }
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
    notices: [{
      id: 'notice-1',
      title: '题库授权说明',
      content: '用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。',
      marqueeText: '题库授权说明：用户完成微信登录后，需要由管理员授权题库后才可进行练习、考试和离线缓存。'
    }]
  }
);
const getCurrentNotice = () => request({ url: '/content/notices/current', auth: false });
const getAdminNotice = () => request({ url: '/admin/content/notice' });
const updateAdminNotice = (payload) => request({
  url: '/admin/content/notice',
  method: 'PUT',
  data: payload
});
const getAdminFeedback = () => request({ url: '/admin/feedback' });

const getBanks = () => request({ url: '/banks' });

const getChapters = (bankId) => request({ url: `/banks/${bankId || ''}/chapters` });

const getPapers = () => withFallback(request({ url: '/exams/papers' }), mock.papers);

const startPractice = (payload) => request({
  url: '/practice/start',
  method: 'POST',
  data: payload
}).then((data) => ({
  ...data,
  questions: (data.questions || []).map((question) => normalizeQuestion(question))
}));

const submitPracticeAnswer = (questionId, answer) => request({
  url: '/practice/answers',
  method: 'POST',
  data: { question_id: questionId, answer }
});

const getRecords = () => request({ url: '/records' }).then((dashboard) => dashboard.records || []);
const getRecordDashboard = () => request({ url: '/records' });
const getPracticeTrends = () => request({ url: '/records/trends' });
const getMistakes = (recordId = '') => request({
  url: recordId ? `/records/${recordId}/mistakes` : '/records/mistakes'
});
const getMistakeDetail = (mistakeId) => request({ url: `/records/mistakes/${mistakeId}` });
const getRecordMistakeDetail = (itemId) => request({ url: `/records/mistake-items/${itemId}` });
const removeMistake = (mistakeId) => request({
  url: `/records/mistakes/${mistakeId}`,
  method: 'DELETE'
}).then(() => getMistakes());
const getFavorites = () => request({ url: '/records/favorites' });
const saveFavorite = (questionId) => request({
  url: '/records/favorites',
  method: 'POST',
  data: { questionId }
});
const removeFavorite = (favoriteId) => request({
  url: `/records/favorites/${favoriteId}`,
  method: 'DELETE'
}).then(() => getFavorites());
const getFavoriteDetail = (favoriteId) => request({ url: `/records/favorites/${favoriteId}` });
const saveCompletedPractice = (payload) => request({
  url: '/records',
  method: 'POST',
  data: payload
});
const getPracticeRecord = (recordId) => request({ url: `/records/${recordId}` });

const getRanking = () => request({ url: '/ranking/me' });
const getLeaderboard = (scope = 'total') => request({ url: `/ranking/leaderboard?scope=${scope}` });
const getMedals = () => withFallback(request({ url: '/ranking/medals' }), [
  { name: '连续学习', desc: '连续学习 7 天获得' },
  { name: '考试达人', desc: '模拟考试达到 90 分获得' },
  { name: '错题清零', desc: '错题多次答对后清零获得' }
]);

const submitFeedback = (content) => request({
  url: '/feedback',
  method: 'POST',
  data: { content, category: 'general' }
});

module.exports = {
  loginByCode,
  ensureIdentity,
  getCurrentUser,
  updateUserProfile,
  getUsers,
  updateUserRole,
  getHomeContent,
  getCurrentNotice,
  getAdminNotice,
  updateAdminNotice,
  getAdminFeedback,
  getBanks,
  getChapters,
  getPapers,
  startPractice,
  submitPracticeAnswer,
  saveCompletedPractice,
  getPracticeRecord,
  getRecords,
  getRecordDashboard,
  getPracticeTrends,
  getMistakes,
  getMistakeDetail,
  getRecordMistakeDetail,
  removeMistake,
  getFavorites,
  saveFavorite,
  removeFavorite,
  getFavoriteDetail,
  getRanking,
  getLeaderboard,
  getMedals,
  submitFeedback
};
