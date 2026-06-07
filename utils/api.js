const app = getApp();

const request = ({ url, method = 'GET', data = {}, header = {} }) => {
  const token = wx.getStorageSync('token') || app.globalData.token;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(res);
      },
      fail: reject
    });
  });
};

module.exports = {
  request
};
