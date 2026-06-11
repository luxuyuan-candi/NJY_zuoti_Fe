const { getPracticeTrends } = require('../../utils/services');

Page({
  data: {
    trends: [],
    maxQuestionCount: 0
  },

  onReady() {
    this._pageReady = true;
    this.renderTrendChart();
  },

  onShow() {
    getPracticeTrends()
      .then((trends) => {
        const normalized = normalizeTrends(trends || []);
        this.setData({
          trends: normalized,
          maxQuestionCount: normalized.reduce((max, item) => Math.max(max, item.questionCount), 0)
        }, () => this.renderTrendChart());
      })
      .catch(() => this.setData({
        trends: [],
        maxQuestionCount: 0
      }, () => this.renderTrendChart()));
  },

  renderTrendChart() {
    if (!this._pageReady) {
      return;
    }
    const trends = this.data.trends || [];
    if (!trends.length) {
      return;
    }
    const query = wx.createSelectorQuery();
    query.select('#trend-canvas').fields({ node: true, size: true }).exec((res) => {
      const canvasRef = res && res[0];
      if (!canvasRef || !canvasRef.node) {
        return;
      }
      drawTrendChart(canvasRef.node, canvasRef.width, canvasRef.height, trends);
    });
  }
});

function normalizeTrends(trends) {
  return (trends || []).map((item) => {
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
}

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function drawTrendChart(canvas, width, height, trends) {
  const dpr = getPixelRatio();
  const ctx = canvas.getContext('2d');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const plot = {
    left: 50,
    right: 18,
    top: 18,
    bottom: 64
  };
  const chartWidth = width - plot.left - plot.right;
  const chartHeight = height - plot.top - plot.bottom;
  const baseY = plot.top + chartHeight;
  const maxQuestionCount = trends.reduce((max, item) => Math.max(max, item.questionCount), 0) || 1;
  const stepX = trends.length > 1 ? chartWidth / (trends.length - 1) : 0;
  const barWidth = Math.max(12, Math.min(28, (trends.length > 1 ? stepX * 0.28 : chartWidth * 0.16)));

  drawGrid(ctx, plot.left, plot.top, chartWidth, chartHeight);
  drawYAxis(ctx, plot.left, plot.top, chartHeight);

  const points = trends.map((item, index) => {
    const x = trends.length > 1 ? plot.left + stepX * index : plot.left + chartWidth / 2;
    const barHeight = Math.max(6, (item.questionCount / maxQuestionCount) * chartHeight);
    drawBar(ctx, x - barWidth / 2, baseY - barHeight, barWidth, barHeight);
    const y = plot.top + chartHeight - (item.accuracy / 100) * chartHeight;
    return { x, y, item };
  });

  drawLine(ctx, points);
  drawXAxis(ctx, points, baseY);
}

function drawGrid(ctx, left, top, width, height) {
  const levels = [0, 0.5, 1];
  ctx.save();
  ctx.strokeStyle = 'rgba(23, 107, 255, 0.16)';
  ctx.setLineDash([4, 4]);
  levels.forEach((level) => {
    const y = top + height - height * level;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
  });
  ctx.restore();
}

function drawYAxis(ctx, left, top, height) {
  const labels = [
    { text: '100%', y: top + 4 },
    { text: '50%', y: top + height / 2 + 4 },
    { text: '0', y: top + height }
  ];
  ctx.save();
  ctx.fillStyle = '#8c97ab';
  ctx.font = '12px sans-serif';
  labels.forEach((label) => {
    ctx.fillText(label.text, 0, label.y);
  });
  ctx.restore();
}

function drawBar(ctx, x, y, width, height) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, 'rgba(25, 167, 206, 0.92)');
  gradient.addColorStop(1, 'rgba(23, 107, 255, 0.45)');
  ctx.save();
  ctx.fillStyle = gradient;
  roundRect(ctx, x, y, width, height, 6);
  ctx.fill();
  ctx.restore();
}

function drawLine(ctx, points) {
  if (!points.length) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = '#176bff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (!index) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = '#176bff';
    ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawXAxis(ctx, points, baseY) {
  ctx.save();
  ctx.fillStyle = '#7c8aa5';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  points.forEach((point) => {
    ctx.fillText(point.item.dateLabel, point.x, baseY + 24);
    ctx.fillText(point.item.timeLabel, point.x, baseY + 40);
  });
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getPixelRatio() {
  if (wx.getWindowInfo) {
    return wx.getWindowInfo().pixelRatio || 1;
  }
  return wx.getSystemInfoSync().pixelRatio || 1;
}
