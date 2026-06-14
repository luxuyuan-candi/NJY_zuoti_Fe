const {
  getFavorites,
  saveFavorite,
  removeFavorite,
  startPractice,
  submitPracticeAnswer,
  saveCompletedPractice
} = require('../../utils/services');

Page({
  data: {
    title: '',
    bankName: '',
    practiceId: '',
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selected: '',
    submitted: false,
    doubtful: false,
    showNavigator: false,
    navItems: [],
    answerResults: {},
    doubtfulMap: {},
    allAnswered: false,
    showAnalysis: true,
    analysisRevealed: false,
    favoriteMap: {},
    favoriteId: ''
  },

  onLoad(query) {
    const app = getApp();
    const lastPracticeConfig = app.globalData.lastPracticeConfig || {};
    const payload = {
      bank_id: query.bankId || lastPracticeConfig.bankId || '',
      chapter_key: decodeURIComponent(query.chapterKey || ''),
      count: Number(query.count || 10),
      order: decodeURIComponent(query.order || '顺序出题') === '顺序出题' ? 'SEQUENTIAL' : 'RANDOM',
      question_ids: ['mistake', 'favorite'].includes(query.source || lastPracticeConfig.source)
        ? (lastPracticeConfig.questionIds || []).slice(0, Number(query.count || 10))
        : []
    };

    this.setData({
      title: decodeURIComponent(query.title || ''),
      bankName: decodeURIComponent(query.bankName || ''),
      showAnalysis: query.showAnalysis !== 'false'
    });
    app.globalData.lastPracticeConfig = {
      source: query.source || lastPracticeConfig.source || '',
      bankId: query.bankId || '',
      chapterKey: decodeURIComponent(query.chapterKey || ''),
      questionIds: payload.question_ids || [],
      selectedCount: Number(query.count || 10),
      title: decodeURIComponent(query.title || ''),
      bankName: decodeURIComponent(query.bankName || ''),
      total: Number(query.total || 0),
      showAnalysis: query.showAnalysis !== 'false'
    };

    startPractice(payload)
      .then((data) => {
        const questions = data.questions || [];
        this.setData({
          practiceId: data.practiceId || '',
          questions
        });
        this.refreshNavItems(questions, {});
        this.syncCurrentQuestion(0);
      })
      .catch(() => wx.showToast({ title: '题目加载失败', icon: 'none' }));

    getFavorites()
      .then((favorites) => {
        const favoriteMap = {};
        (favorites || []).forEach((item) => {
          if (item.questionId) {
            favoriteMap[item.questionId] = item.id;
          }
        });
        this.setData({ favoriteMap }, () => this.syncCurrentQuestion(this.data.currentIndex || 0));
      })
      .catch(() => this.setData({ favoriteMap: {} }));
  },

  syncCurrentQuestion(index) {
    const currentQuestion = this.data.questions[index] || null;
    const result = currentQuestion ? this.data.answerResults[currentQuestion.id] : null;
    const doubtful = currentQuestion ? !!this.data.doubtfulMap[currentQuestion.id] : false;
    const favoriteId = currentQuestion ? (this.data.favoriteMap[currentQuestion.id] || '') : '';
    this.setData({
      currentIndex: index,
      currentQuestion,
      selected: result ? result.selected : '',
      submitted: !!result,
      doubtful,
      analysisRevealed: result ? !!result.analysisRevealed : false,
      favoriteId
    });
  },

  refreshNavItems(questions, answerResults, doubtfulMap = this.data.doubtfulMap) {
    const allAnswered = (questions || []).length > 0
      && (questions || []).every((question) => !!answerResults[question.id]);
    this.setData({
      navItems: (questions || []).map((question, index) => ({
        index,
        label: index + 1,
        answered: !!answerResults[question.id],
        doubtful: !!doubtfulMap[question.id]
      })),
      allAnswered
    });
  },

  selectOption(e) {
    const selected = e.currentTarget.dataset.key;
    const currentQuestion = this.data.currentQuestion;
    const existingResult = currentQuestion ? this.data.answerResults[currentQuestion.id] : null;
    const changedAfterSubmit = !!existingResult && existingResult.selected !== selected;
    this.setData({
      selected,
      submitted: changedAfterSubmit ? false : this.data.submitted
    });
  },

  submit() {
    const { currentQuestion, selected, answerResults } = this.data;
    if (!currentQuestion) return;
    const isPractical = !((currentQuestion.options || []).length);
    const submittedAnswer = isPractical ? '__PRACTICAL_COMPLETED__' : selected;
    if (!submittedAnswer) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }

    submitPracticeAnswer(currentQuestion.id, submittedAnswer)
      .then((result) => {
        const nextQuestions = this.data.questions.map((question) => (
          question.id === currentQuestion.id
            ? {
              ...question,
              answer: result.answer || '',
              analysis: result.analysis || ''
            }
            : question
        ));
        const nextResults = {
          ...answerResults,
          [currentQuestion.id]: {
            selected: submittedAnswer,
            correct: !!result.correct,
            answer: result.answer || '',
            analysis: result.analysis || '',
            analysisRevealed: this.data.showAnalysis
          }
        };
        this.setData({
          questions: nextQuestions,
          answerResults: nextResults,
          submitted: true,
          analysisRevealed: this.data.showAnalysis,
          currentQuestion: {
            ...currentQuestion,
            answer: result.answer || '',
            analysis: result.analysis || ''
          }
        });
        this.refreshNavItems(nextQuestions, nextResults);
      })
      .catch(() => wx.showToast({ title: '提交失败', icon: 'none' }));
  },

  revealAnalysis() {
    const { currentQuestion, answerResults } = this.data;
    if (!currentQuestion) return;
    const currentResult = answerResults[currentQuestion.id];
    if (!currentResult) return;
    const nextResults = {
      ...answerResults,
      [currentQuestion.id]: {
        ...currentResult,
        analysisRevealed: true
      }
    };
    this.setData({
      answerResults: nextResults,
      analysisRevealed: true
    });
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      const firstUnansweredIndex = this.data.questions.findIndex(
        (question) => !this.data.answerResults[question.id]
      );
      if (firstUnansweredIndex >= 0) {
        this.syncCurrentQuestion(firstUnansweredIndex);
        return;
      }
      this.finish();
      return;
    }
    this.syncCurrentQuestion(nextIndex);
  },

  openQuestion(e) {
    const index = Number(e.currentTarget.dataset.index || 0);
    this.setData({ showNavigator: false });
    this.syncCurrentQuestion(index);
  },

  toggleDoubtful() {
    const { currentQuestion, doubtfulMap, doubtful, questions, answerResults } = this.data;
    if (!currentQuestion) return;
    const nextDoubtful = !doubtful;
    const nextMap = {
      ...doubtfulMap,
      [currentQuestion.id]: nextDoubtful
    };
    if (!nextDoubtful) {
      delete nextMap[currentQuestion.id];
    }
    this.setData({
      doubtful: nextDoubtful,
      doubtfulMap: nextMap
    });
    this.refreshNavItems(questions, answerResults, nextMap);
  },

  toggleFavorite() {
    const { currentQuestion, favoriteId } = this.data;
    if (!currentQuestion) return;
    if (favoriteId) {
      removeFavorite(favoriteId)
        .then((favorites) => {
          const favoriteMap = buildFavoriteMap(favorites);
          this.setData({ favoriteMap }, () => {
            this.syncCurrentQuestion(this.data.currentIndex);
            wx.showToast({ title: '已取消收藏', icon: 'none' });
          });
        })
        .catch(() => wx.showToast({ title: '取消收藏失败', icon: 'none' }));
      return;
    }
    saveFavorite(currentQuestion.id)
      .then((favorite) => {
        const favoriteMap = {
          ...this.data.favoriteMap,
          [currentQuestion.id]: favorite.id
        };
        this.setData({ favoriteMap }, () => {
          this.syncCurrentQuestion(this.data.currentIndex);
          wx.showToast({ title: '已收藏', icon: 'none' });
        });
      })
      .catch(() => wx.showToast({ title: '收藏失败', icon: 'none' }));
  },

  toggleNavigator() {
    this.setData({ showNavigator: !this.data.showNavigator });
  },

  finish() {
    const { questions, answerResults, title, bankName } = this.data;
    const answeredQuestions = questions.map((question) => {
      const result = answerResults[question.id] || null;
      return { question, result };
    });
    const answeredCount = answeredQuestions.filter((item) => item.result).length;
    const correctCount = answeredQuestions.filter((item) => item.result && item.result.correct).length;
    const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

    const summaryMap = {};
    answeredQuestions.forEach(({ question, result }) => {
      const groupName = (((question.knowledge || {}).pathNames || [])[1]) || title || bankName || '题库';
      if (!summaryMap[groupName]) {
        summaryMap[groupName] = { name: groupName, total: 0, correct: 0, accuracy: 0 };
      }
      if (result) {
        summaryMap[groupName].total += 1;
        if (result.correct) summaryMap[groupName].correct += 1;
      }
    });

    const details = Object.values(summaryMap).map((item) => ({
      name: item.name,
      accuracy: item.total ? Math.round((item.correct / item.total) * 100) : 0
    }));

    saveCompletedPractice({
      type: '练习',
      title: title || bankName || '练习结果',
      bankId: (getApp().globalData.lastPracticeConfig || {}).bankId || '',
      chapterKey: (getApp().globalData.lastPracticeConfig || {}).chapterKey || '',
      answeredCount,
      correctCount,
      wrongCount: answeredCount - correctCount,
      accuracy,
      details,
      retryConfig: getApp().globalData.lastPracticeConfig || null,
      questions: answeredQuestions
        .filter((item) => !!item.result)
        .map(({ question, result }) => ({
          questionId: question.id,
          stem: question.stem || '',
          chapter: (((question.knowledge || {}).pathNames || []).slice(0, -1).join(' / ')) || title || bankName || '练习题',
          selected: result.selected === '__PRACTICAL_COMPLETED__' ? '' : result.selected,
          answer: result.answer || '',
          correct: !!result.correct,
          analysis: result.analysis || '',
          type: question.type || '',
          typeLabel: question.typeLabel || ''
        }))
    }).then((record) => {
      getApp().globalData.lastPracticeResult = record;
      wx.redirectTo({ url: `/pages/practice/result?recordId=${record.id}` });
    }).catch(() => wx.showToast({ title: '结果保存失败', icon: 'none' }));
  }
});

function buildFavoriteMap(favorites) {
  const favoriteMap = {};
  (favorites || []).forEach((item) => {
    if (item.questionId) {
      favoriteMap[item.questionId] = item.id;
    }
  });
  return favoriteMap;
}
