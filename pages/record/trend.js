const { getPracticeTrends } = require('../../utils/services');

const CHART_HEIGHT_RPX = 360;
const BAR_WIDTH_RPX = 32;
const POINT_SIZE_RPX = 18;

Page({
  data: {
    trends: [],
    chartBars: [],
    chartPoints: [],
    chartSegments: [],
    yAxisLabels: ['100%', '50%', '0'],
    maxQuestionCount: 0
  },

  onShow() {
    getPracticeTrends()
      .then((trends) => {
        const chartData = buildChartData(trends || []);
        this.setData({
          trends: chartData.trends,
          chartBars: chartData.chartBars,
          chartPoints: chartData.chartPoints,
          chartSegments: chartData.chartSegments,
          maxQuestionCount: chartData.maxQuestionCount
        });
      })
      .catch(() => this.setData({
        trends: [],
        chartBars: [],
        chartPoints: [],
        chartSegments: [],
        maxQuestionCount: 0
      }));
  }
});

function buildChartData(trends) {
  const normalized = (trends || []).map((item) => {
    const dateTime = item.dateTime || item.label || '';
    const [datePart = '', timePart = ''] = dateTime.split(' ');
    return {
      ...item,
      dateTime,
      dateLabel: datePart.slice(5),
      timeLabel: timePart.slice(0, 5),
      accuracy: clamp(item.accuracy),
      questionCount: Math.max(0, Number(item.questionCount) || 0)
    };
  });

  const maxQuestionCount = normalized.reduce((max, item) => Math.max(max, item.questionCount), 0);
  const chartBars = normalized.map((item, index) => ({
    ...item,
    barStyle: buildBarStyle(item, index, normalized.length, maxQuestionCount)
  }));
  const chartPoints = normalized.map((item, index) => ({
    ...item,
    pointStyle: buildPointStyle(item, index, normalized.length)
  }));
  const chartSegments = normalized.slice(0, -1).map((item, index) => (
    buildSegment(item, normalized[index + 1], index, normalized.length)
  ));

  return {
    trends: normalized,
    chartBars,
    chartPoints,
    chartSegments,
    maxQuestionCount
  };
}

function buildBarStyle(item, index, total, maxQuestionCount) {
  const left = getLeftPercent(index, total);
  const height = maxQuestionCount ? Math.max((item.questionCount / maxQuestionCount) * 100, 6) : 0;
  return [
    `left: calc(${left}% - ${BAR_WIDTH_RPX / 2}rpx)`,
    `height: ${height}%`,
    `width: ${BAR_WIDTH_RPX}rpx`
  ].join(';');
}

function buildPointStyle(item, index, total) {
  const left = getLeftPercent(index, total);
  const bottom = item.accuracy;
  return [
    `left: calc(${left}% - ${POINT_SIZE_RPX / 2}rpx)`,
    `bottom: calc(${bottom}% - ${POINT_SIZE_RPX / 2}rpx)`,
    `width: ${POINT_SIZE_RPX}rpx`,
    `height: ${POINT_SIZE_RPX}rpx`
  ].join(';');
}

function buildSegment(start, end, index, total) {
  const startX = getLeftPercent(index, total);
  const endX = getLeftPercent(index + 1, total);
  const startY = start.accuracy;
  const endY = end.accuracy;
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    id: `${start.id || index}-${end.id || index + 1}`,
    segmentStyle: [
      `left: ${startX}%`,
      `bottom: ${startY}%`,
      `width: ${length}%`,
      `transform: rotate(${angle}deg)`
    ].join(';')
  };
}

function getLeftPercent(index, total) {
  if (total <= 1) {
    return 50;
  }
  return 6 + ((88 / (total - 1)) * index);
}

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
