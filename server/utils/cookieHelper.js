const isProduction = process.env.NODE_ENV === 'production';
const sameSitePolicy = (process.env.COOKIE_SAME_SITE || 'strict').toLowerCase();
const isSecure = isProduction || sameSitePolicy === 'none';

const AUTH_COOKIE_NAME = 'saas_auth_session';
const REFRESH_COOKIE_NAME = 'saas_refresh_session';

/**
 * Standard security options for authentication session cookies
 */
const getAuthCookieOptions = (maxAgeMs = 15 * 60 * 1000) => ({
  httpOnly: true,
  secure: isSecure,
  sameSite: sameSitePolicy,
  path: '/',
  maxAge: maxAgeMs,
});

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: isSecure,
  sameSite: sameSitePolicy,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

function setAuthCookies(res, { accessToken, refreshToken }) {
  if (accessToken) {
    res.cookie(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions(15 * 60 * 1000));
  }
  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  }
}

function clearAuthCookies(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(0),
    maxAge: 0,
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: 0,
  });
}

module.exports = {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  getAuthCookieOptions,
  getRefreshCookieOptions,
  setAuthCookies,
  clearAuthCookies,
};
