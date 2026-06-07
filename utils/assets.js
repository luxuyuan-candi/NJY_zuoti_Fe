const assetUrl = (path) => {
  const app = getApp();
  const baseUrl = app.globalData.assetBaseUrl.replace(/\/$/, '');
  return `${baseUrl}/${path.replace(/^\//, '')}`;
};

module.exports = {
  assetUrl
};
