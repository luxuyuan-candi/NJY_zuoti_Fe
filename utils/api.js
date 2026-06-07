const app = getApp();

const request = ({ url, method = 'GET', data = {}, header = {}, auth = true }) => {
  const token = wx.getStorageSync('token') || app.globalData.token;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data && res.data.success === false) {
            reject(res.data);
            return;
          }
          resolve(res.data && Object.prototype.hasOwnProperty.call(res.data, 'data') ? res.data.data : res.data);
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
