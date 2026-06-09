const { startPractice, submitPracticeAnswer } = require('../../utils/services');

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
    allAnswered: false
  },

  onLoad(query) {
    const payload = {
      bank_id: query.bankId || '',
      chapter_key: decodeURIComponent(query.chapterKey || ''),
      count: Number(query.count || 10),
      order: decodeURIComponent(query.order || '顺序出题') === '顺序出题' ? 'SEQUENTIAL' : 'RANDOM'
    };

    this.setData({
      title: decodeURIComponent(query.title || ''),
      bankName: decodeURIComponent(query.bankName || '')
    });

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
  },

  syncCurrentQuestion(index) {
    const currentQuestion = this.data.questions[index] || null;
    const result = currentQuestion ? this.data.answerResults[currentQuestion.id] : null;
    const doubtful = currentQuestion ? !!this.data.doubtfulMap[currentQuestion.id] : false;
    this.setData({
      currentIndex: index,
      currentQuestion,
      selected: result ? result.selected : '',
      submitted: !!result,
      doubtful
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
    if (!selected) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }

    submitPracticeAnswer(currentQuestion.id, selected)
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
            selected,
            correct: !!result.correct,
            answer: result.answer || '',
            analysis: result.analysis || ''
          }
        };
        this.setData({
          questions: nextQuestions,
          answerResults: nextResults,
          submitted: true,
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

    getApp().globalData.lastPracticeResult = {
      title: title || bankName || '练习结果',
      answeredCount,
      correctCount,
      wrongCount: answeredCount - correctCount,
      accuracy,
      details
    };
    wx.navigateTo({ url: '/pages/practice/result' });
  }
});
