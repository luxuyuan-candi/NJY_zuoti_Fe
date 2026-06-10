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
  const activeMistakesByQuestion = {};
  const mistakeEntries = [];
  orderedRecords.forEach((record) => {
    (record.questions || []).forEach((item) => {
      const questionId = item.questionId;
      if (!questionId) {
        return;
      }
      if (item.correct) {
        (activeMistakesByQuestion[questionId] || []).forEach((entry) => {
          entry.correctTimes += 1;
          if (entry.correctTimes >= 2) {
            entry.resolved = true;
          }
        });
        activeMistakesByQuestion[questionId] = (activeMistakesByQuestion[questionId] || [])
          .filter((entry) => !entry.resolved);
      } else {
        const entry = {
          id: `${record.id}:${questionId}`,
          questionId,
          title: item.stem || '未命名题目',
          chapter: item.chapter || record.title || '练习题',
          correctTimes: 0,
          wrongAt: record.createdAt,
          resolved: false
        };
        if (!activeMistakesByQuestion[questionId]) {
          activeMistakesByQuestion[questionId] = [];
        }
        activeMistakesByQuestion[questionId].push(entry);
        mistakeEntries.push(entry);
      }
    });
  });

  const dismissed = getDismissedMistakes();
  return mistakeEntries
    .filter((item) => !item.resolved)
    .filter((item) => !dismissed[item.id])
    .sort((left, right) => new Date(right.wrongAt).getTime() - new Date(left.wrongAt).getTime())
    .map((item) => ({
      id: item.id,
      questionId: item.questionId,
      title: item.title,
      chapter: item.chapter,
      correctTimes: item.correctTimes
    }));
};

const getPracticeDashboard = () => {
  const records = listCompletedPracticeRecords();
  const practiceRecords = records.filter((item) => item.type === '练习');
  const totalAnswered = records.reduce((sum, item) => sum + Number(item.answeredCount || 0), 0);
  const totalWrong = records.reduce((sum, item) => sum + Number(item.wrongCount || 0), 0);
  const accuracy = totalAnswered ? Math.round(((totalAnswered - totalWrong) / totalAnswered) * 100) : 0;
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
