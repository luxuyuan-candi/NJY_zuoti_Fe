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
  type: question.type === 'single_choice' ? '单选题' : question.type || '单选题'
});

const loginByCode = (payload) => request({
  url: '/auth/login',
  method: 'POST',
  data: payload,
  auth: false
});

const ensureIdentity = () => {
  const token = wx.getStorageSync('token');
  if (token) {
    return getCurrentUser().catch(() => wx.getStorageSync('user') || null);
  }

  return new Promise((resolve, reject) => {
    wx.login({
      success: ({ code }) => {
        if (!code) {
          reject(new Error('missing wx login code'));
          return;
        }
        loginByCode({ code })
          .then((data) => {
            const app = getApp();
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('user', data.user);
            app.globalData.token = data.token;
            app.globalData.user = data.user;
            resolve(data.user);
          })
          .catch(reject);
      },
      fail: reject
    });
  });
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

const getHomeContent = () => withFallback(
  request({ url: '/content/home', auth: false }),
  {
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
    ],
    notices: [{ id: 'notice-1', title: '题库授权说明' }]
  }
);

const getBanks = () => withFallback(request({ url: '/banks' }), mock.banks);

const getChapters = (bankId) => withFallback(
  request({ url: `/banks/${bankId || 'bank-exam-1'}/chapters` }).then((data) => data.chapters || data),
  mock.chapters
);

const getPapers = () => withFallback(request({ url: '/exams/papers' }), mock.papers);

const startPractice = () => withFallback(
  request({ url: '/practice/start', method: 'POST' }).then((data) => normalizeQuestion(data.question || data)),
  normalizeQuestion(mock.question)
);

const submitPracticeAnswer = (questionId, answer) => request({
  url: '/practice/answers',
  method: 'POST',
  data: { question_id: questionId, answer }
});

const getRecords = () => withFallback(request({ url: '/records' }), mock.records);
const getMistakes = () => withFallback(request({ url: '/records/mistakes' }), mock.mistakes);
const getFavorites = () => withFallback(request({ url: '/records/favorites' }), mock.favorites);

const getRanking = () => withFallback(request({ url: '/ranking/me' }), { total: 128, weekly: 16, currentScore: 2680 });
const getLeaderboard = () => withFallback(request({ url: '/ranking/leaderboard' }), [
  { rank: 1, name: '学习用户 A', score: 3120 },
  { rank: 2, name: '学习用户 B', score: 2980 },
  { rank: 16, name: '我', score: 2680 }
]);
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
  getHomeContent,
  getBanks,
  getChapters,
  getPapers,
  startPractice,
  submitPracticeAnswer,
  getRecords,
  getMistakes,
  getFavorites,
  getRanking,
  getLeaderboard,
  getMedals,
  submitFeedback
};
