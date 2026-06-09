const { request } = require('./api');
const { assetUrl } = require('./assets');
const mock = require('./mock');
const practiceHistory = require('./practice-history');

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

const getRecords = () => Promise.resolve(practiceHistory.getPracticeDashboard().records);
const getRecordDashboard = () => Promise.resolve(practiceHistory.getPracticeDashboard());
const getPracticeTrends = () => Promise.resolve(practiceHistory.getPracticeTrends());
const getMistakes = () => Promise.resolve(practiceHistory.getMistakeBook());
const removeMistake = (questionId) => {
  practiceHistory.dismissMistake(questionId);
  return Promise.resolve(practiceHistory.getMistakeBook());
};
const getFavorites = () => withFallback(request({ url: '/records/favorites' }), mock.favorites);
const saveCompletedPractice = (payload) => {
  const record = practiceHistory.createCompletedPracticeRecord(payload);
  practiceHistory.saveCompletedPracticeRecord(record);
  return Promise.resolve(record);
};
const getPracticeRecord = (recordId) => Promise.resolve(practiceHistory.getPracticeRecordById(recordId));

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
  getUsers,
  updateUserRole,
  getHomeContent,
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
  removeMistake,
  getFavorites,
  getRanking,
  getLeaderboard,
  getMedals,
  submitFeedback
};
