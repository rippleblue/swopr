const proxyPrefix = 'https://app.zhaoyingze.com/tinywall/tinywall.php?'
const baseUrl = 'https://www.youtube.com/'

const handleInstall = () => {
  console.log('[SW] service worker installed');
  self.skipWaiting();
};

const handleActivate = () => {
  console.log('[SW] service worker activated');
  return self.clients.claim();
};

const proxyHost = (new URL(proxyPrefix)).origin

const handleFetch = async (e) => {
  const {request} = e;
  const {method: reqMethod, url: reqUrl, headers: reqHeaders} = request;
  console.log(`[SW] handle request ${reqUrl}`);

  // Extract remote url from request
  let redirectUrl = '';
  if (reqUrl.startsWith(proxyPrefix)) {
    // Absolute url with proxy, we don't need to change it.
    redirectUrl = reqUrl;
  } else {
    // It's may be a bad relative url
    if (reqUrl.startsWith(proxyHost) || reqUrl.startsWith('http://localhost')) {
      redirectUrl = proxyPrefix + baseUrl + reqUrl.substr((new URL(reqUrl)).origin.length)
    } else if (reqUrl.startsWith('//')) {
      redirectUrl = proxyPrefix + 'http:' + reqUrl;
    } else if (!reqUrl.startsWith('http')) {
      redirectUrl = proxyPrefix + baseUrl + reqUrl;
    } else {
      redirectUrl = proxyPrefix + reqUrl;
    }
  }

  console.log(`[SW] proxying request ${reqMethod}: ${reqUrl} -> ${redirectUrl}`);
  const init = { mode: 'cors', method: reqMethod, headers: reqHeaders, credentials: 'include' }
  if (reqMethod === 'POST' && !request.bodyUsed) {
    if (request.body) {
      init.body = request.body
    } else {
      const buf = await request.arrayBuffer()
      if (buf.byteLength > 0) {
        init.body = buf
      }
    }
  }
  e.respondWith(fetch(redirectUrl, init));
};

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);
