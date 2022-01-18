const handleInstall = () => {
  console.log('[SW] service worker installed');
  self.skipWaiting();
};

const handleActivate = () => {
  console.log('[SW] service worker activated');
  return self.clients.claim();
};

const proxyPrefix = 'https://app.zhaoyingze.com/httpass/?'
const baseUrl = 'https://www.youtube.com/'

const proxyHost = (new URL(proxyPrefix)).origin

const handleFetch = async (e) => {
  const {request} = e;
  const {method: reqMethod, url: reqUrl} = request;
  console.log(`[SW] handle request ${reqUrl}`);

  // Extract remote url from request
  let remoteUrl = reqUrl;
  if (reqUrl.startsWith(proxyPrefix)) {
    remoteUrl = reqUrl.substr(proxyPrefix.length);
  }
  if (reqUrl.startsWith(proxyHost)) {
    remoteUrl = reqUrl.substr(proxyHost.length)
  }
  if (remoteUrl.startsWith('//')) {
    remoteUrl = 'http:' + remoteUrl;
  }
  if (!remoteUrl.startsWith('http')) {
    remoteUrl = baseUrl + remoteUrl;
  }
  const redirectUrl = proxyPrefix + remoteUrl;

  console.log(`[SW] proxying request ${reqMethod}: ${reqUrl} -> ${redirectUrl}`);
  e.respondWith(fetch(redirectUrl));
};

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);
