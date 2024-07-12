export const Configs = {
  API_URL:
    window.location.hostname.indexOf("localhost") > -1
      ? "http://localhost"
      : "https://core.deephousetehran.net",
  API_PORT: window.location.hostname.indexOf("localhost") > -1 ? 9000 : "",
  PLAYBACK_PORT: window.location.hostname.indexOf("localhost") > -1 ? 8000 : "",
  LIVE_PORT: window.location.hostname.indexOf("localhost") > -1 ? 8000 : "",
  LIVE_URL:
    window.location.hostname.indexOf("localhost") > -1
      ? "http://localhost:8000/stream"
      : "https://live.deephousetehran.net/stream",
  IS_PRODUCTION: window.location.hostname.indexOf("localhost") > -1,
  DEFAULT_LANG: "EN",
};
