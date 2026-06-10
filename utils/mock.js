const banks = [
  {
    id: 'bank-exam-1',
    type: '考试类',
    name: '综合能力考试题库',
    desc: '覆盖基础知识、判断推理、综合应用。',
    total: 1280,
    done: 426,
    accuracy: 82,
    cached: '已缓存'
  },
  {
    id: 'bank-course-1',
    type: '课程类',
    name: '课程学习巩固题库',
    desc: '按课程章节拆分，适合课后复习。',
    total: 860,
    done: 188,
    accuracy: 76,
    cached: '需更新'
  }
];

const chapters = [
  { id: 'c1', name: '第一章 基础概念', total: 120, done: 86, accuracy: 88, cached: '已缓存' },
  { id: 'c2', name: '第二章 业务流程', total: 156, done: 64, accuracy: 79, cached: '未缓存' },
  { id: 'c3', name: '第三章 综合应用', total: 210, done: 42, accuracy: 72, cached: '需更新' }
];

const papers = [
  { id: 'p1', name: '综合能力模拟卷（一）', total: 60, minutes: 90, best: 92, count: 2 },
  { id: 'p2', name: '课程结业测试卷', total: 40, minutes: 60, best: 86, count: 1 },
  { id: 'p3', name: '错题强化套卷', total: 30, minutes: 45, best: 0, count: 0 }
];

const question = {
  id: 'q1',
  no: 1,
  total: 20,
  type: '单选题',
  stem: '关于题库授权访问规则，下列说法正确的是？',
  options: [
    { key: 'A', text: '所有访客都可以直接查看题库' },
    { key: 'B', text: '注册后仍需管理员授权才可查看题库' },
    { key: 'C', text: '只有购买会员后才能查看题库' },
    { key: 'D', text: '离线缓存不需要校验授权' }
  ],
  answer: 'B',
  analysis: '系统规则要求用户注册后仍需管理员授权，后端接口也必须按授权范围过滤题库。'
};

const records = [
  { id: 'r1', title: '综合能力考试题库练习', score: '82%', date: '2026-06-07', type: '练习' },
  { id: 'r2', title: '综合能力模拟卷（一）', score: '92分', date: '2026-06-06', type: '考试' }
];

const mistakes = [
  { id: 'm1', title: '题库访问权限判断', chapter: '第一章 基础概念', wrongTimes: 1 },
  { id: 'm2', title: '离线缓存版本规则', chapter: '第二章 业务流程', wrongTimes: 2 }
];

const favorites = [
  { id: 'f1', title: 'openid 身份识别规则', chapter: '第一章 基础概念' },
  { id: 'f2', title: '错题自动移出策略', chapter: '第三章 综合应用' }
];

module.exports = {
  banks,
  chapters,
  papers,
  question,
  records,
  mistakes,
  favorites
};
