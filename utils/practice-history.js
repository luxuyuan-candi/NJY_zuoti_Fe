const PRACTICE_HISTORY_KEY_PREFIX = 'practiceHistory:';
const PRACTICE_MISTAKE_DISMISS_KEY_PREFIX = 'practiceMistakeDismiss:';
const HISTORY_LIMIT = 100;

const getCurrentOpenid = () => {
  const app = typeof getApp === 'function' ? getApp() : null;
  const appUser = app && app.globalData ? app.globalData.user : null;
  const storageUser = wx.getStorageSync('user') || {};
  return (appUser && appUser.openid) || storageUser.openid || 'anonymous';
};

const buildStorageKey = (prefix) => `${prefix}${getCurrentOpenid()}`;

const readJson = (key, fallback) => {
  try {
    const value = wx.getStorageSync(key);
    return value || fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  wx.setStorageSync(key, value);
};

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    dateTime: `${year}-${month}-${day} ${hours}:${minutes}`
  };
};

const listCompletedPracticeRecords = () => {
  const items = readJson(buildStorageKey(PRACTICE_HISTORY_KEY_PREFIX), []);
  return Array.isArray(items) ? items : [];
};

const getPracticeRecordById = (recordId) => (
  listCompletedPracticeRecords().find((item) => item.id === recordId) || null
);

const saveCompletedPracticeRecord = (record) => {
  const records = listCompletedPracticeRecords();
  const nextRecords = [record, ...records].slice(0, HISTORY_LIMIT);
  writeJson(buildStorageKey(PRACTICE_HISTORY_KEY_PREFIX), nextRecords);
  return record;
};

const getDismissedMistakes = () => {
  const items = readJson(buildStorageKey(PRACTICE_MISTAKE_DISMISS_KEY_PREFIX), {});
  return items && typeof items === 'object' ? items : {};
};

const dismissMistake = (questionId) => {
  const dismissed = getDismissedMistakes();
  dismissed[questionId] = new Date().toISOString();
  writeJson(buildStorageKey(PRACTICE_MISTAKE_DISMISS_KEY_PREFIX), dismissed);
};

const buildRecordSummary = (record) => ({
  id: record.id,
  title: record.title,
  type: record.type,
  score: record.type === '考试' ? `${record.accuracy}%` : `${record.accuracy}%`,
  date: record.date,
  dateTime: record.dateTime,
  accuracy: record.accuracy,
  answeredCount: record.answeredCount,
  correctCount: record.correctCount,
  wrongCount: record.wrongCount
});

const aggregateMistakes = (records) => {
  const orderedRecords = [...records].sort((left, right) => (
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  ));
  const states = {};
  orderedRecords.forEach((record) => {
    (record.questions || []).forEach((item) => {
      const questionId = item.questionId;
      if (!questionId) {
        return;
      }
      const currentState = states[questionId] || {
        id: questionId,
        title: item.stem || '未命名题目',
        chapter: item.chapter || record.title || '练习题',
        correctTimes: 0,
        active: false,
        lastWrongAt: '',
        lastSeenAt: ''
      };
      currentState.title = item.stem || currentState.title;
      currentState.chapter = item.chapter || currentState.chapter;
      currentState.lastSeenAt = record.createdAt;
      if (item.correct) {
        if (currentState.active) {
          currentState.correctTimes += 1;
          if (currentState.correctTimes >= 2) {
            currentState.active = false;
          }
        }
      } else {
        currentState.active = true;
        currentState.correctTimes = 0;
        currentState.lastWrongAt = record.createdAt;
      }
      states[questionId] = currentState;
    });
  });

  const dismissed = getDismissedMistakes();
  return Object.values(states)
    .filter((item) => item.active)
    .filter((item) => {
      const dismissedAt = dismissed[item.id];
      return !dismissedAt || new Date(item.lastWrongAt).getTime() > new Date(dismissedAt).getTime();
    })
    .sort((left, right) => new Date(right.lastWrongAt).getTime() - new Date(left.lastWrongAt).getTime())
    .map((item) => ({
      id: item.id,
      title: item.title,
      chapter: item.chapter,
      correctTimes: item.correctTimes
    }));
};

const getPracticeDashboard = () => {
  const records = listCompletedPracticeRecords();
  const practiceRecords = records.filter((item) => item.type === '练习');
  const totalAnswered = records.reduce((sum, item) => sum + Number(item.answeredCount || 0), 0);
  const totalCorrect = records.reduce((sum, item) => sum + Number(item.correctCount || 0), 0);
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const mistakes = aggregateMistakes(records);

  return {
    hasCompletedPractice: records.length > 0,
    stats: [
      { label: '总做题数', value: String(totalAnswered) },
      { label: '正确率', value: `${accuracy}%` },
      { label: '考试数', value: String(records.length) }
    ],
    records: records.map((item) => buildRecordSummary(item)),
    mistakeCount: mistakes.length,
    practiceCount: practiceRecords.length,
    examCount: records.length
  };
};

const getPracticeTrends = () => {
  const records = listCompletedPracticeRecords()
    .slice()
    .reverse()
    .slice(-7);
  return records.map((record) => ({
    label: record.date ? record.date.slice(5) : '',
    value: Math.max(0, Math.min(100, Number(record.accuracy || 0)))
  }));
};

const getMistakeBook = () => aggregateMistakes(listCompletedPracticeRecords());

const createCompletedPracticeRecord = (payload) => {
  const now = new Date();
  const formatted = formatDate(now);
  return {
    id: `practice-${now.getTime()}`,
    type: payload.type || '练习',
    title: payload.title || '练习结果',
    date: formatted.date,
    time: formatted.time,
    dateTime: formatted.dateTime,
    createdAt: now.toISOString(),
    accuracy: Number(payload.accuracy || 0),
    answeredCount: Number(payload.answeredCount || 0),
    correctCount: Number(payload.correctCount || 0),
    wrongCount: Number(payload.wrongCount || 0),
    details: payload.details || [],
    retryConfig: payload.retryConfig || null,
    questions: payload.questions || []
  };
};

module.exports = {
  listCompletedPracticeRecords,
  getPracticeRecordById,
  saveCompletedPracticeRecord,
  createCompletedPracticeRecord,
  getPracticeDashboard,
  getPracticeTrends,
  getMistakeBook,
  dismissMistake
};
