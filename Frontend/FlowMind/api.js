// FlowMind — API client
// Single gateway between the UI and the FlowMind backend.
// Exposes window.API with auth + data methods. JWT tokens are kept in
// localStorage; a 401 triggers one transparent refresh-and-retry.

window.API = (() => {
  // ── configuration ──────────────────────────────────────────────
  // Backend base URL. Override by setting window.FLOWMIND_API_BASE
  // before this script loads (handy for local backend testing).
  const BASE =
    (window.FLOWMIND_API_BASE || 'https://flowmind-api-0168.onrender.com') +
    '/api/v1';

  const TOKEN_KEY = 'flowmind_access_token';
  const REFRESH_KEY = 'flowmind_refresh_token';

  // ── token storage ──────────────────────────────────────────────
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getRefresh = () => localStorage.getItem(REFRESH_KEY);

  function setTokens(t) {
    if (t && t.access_token) localStorage.setItem(TOKEN_KEY, t.access_token);
    if (t && t.refresh_token) localStorage.setItem(REFRESH_KEY, t.refresh_token);
  }
  function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  // ── core request helper ────────────────────────────────────────
  async function request(path, opts) {
    opts = opts || {};
    const method = opts.method || 'GET';
    const auth = opts.auth !== false; // authenticated by default
    const headers = { 'Content-Type': 'application/json' };
    if (auth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();

    let res;
    try {
      res = await fetch(BASE + path, {
        method,
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) {
      throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
    }

    // One transparent refresh-and-retry on an expired access token.
    if (res.status === 401 && auth && getRefresh() && !opts._retried) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request(path, Object.assign({}, opts, { _retried: true }));
      }
      clearTokens();
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      let msg = (data && (data.detail || data.message)) || ('Error ' + res.status);
      if (Array.isArray(msg)) msg = msg.map((m) => m.msg || m).join(', ');
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    return data;
  }

  async function tryRefresh() {
    try {
      const data = await request('/auth/refresh', {
        method: 'POST',
        body: { refresh_token: getRefresh() },
        auth: false,
      });
      setTokens(data);
      return true;
    } catch (e) {
      return false;
    }
  }

  function qs(params) {
    const clean = {};
    Object.keys(params || {}).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        clean[k] = params[k];
      }
    });
    const s = new URLSearchParams(clean).toString();
    return s ? '?' + s : '';
  }

  // ── public API ─────────────────────────────────────────────────
  return {
    BASE,
    isAuthed: () => !!getToken(),
    logout: clearTokens,

    // auth
    async register(fullName, email, password) {
      const data = await request('/auth/register', {
        method: 'POST',
        auth: false,
        body: { full_name: fullName, email, password },
      });
      setTokens(data);
      return data;
    },
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      });
      setTokens(data);
      return data;
    },
    forgotPassword: (email) =>
      request('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: { email },
      }),
    me: () => request('/auth/me'),
    onboardingStatus: () => request('/auth/onboarding-status'),
    completeOnboarding: (monthlyIncome, weeklyBudget) =>
      request('/users/me/onboarding', {
        method: 'POST',
        body: {
          monthly_income: monthlyIncome,
          weekly_budget: weeklyBudget,
          onboarding_completed: true,
        },
      }),

    // expenses
    listExpenses: (params) => request('/expenses' + qs(params)),
    createExpense: (payload) =>
      request('/expenses', { method: 'POST', body: payload }),
    updateExpense: (id, payload) =>
      request('/expenses/' + id, { method: 'PATCH', body: payload }),
    deleteExpense: (id) => request('/expenses/' + id, { method: 'DELETE' }),
    expensesByCategory: () => request('/expenses/by-category'),

    // analytics
    overview: () => request('/analytics/overview'),
    weekly: () => request('/analytics/weekly'),
    monthly: () => request('/analytics/monthly'),
    savingsTrend: () => request('/analytics/savings-trend'),
    heatmap: () => request('/analytics/heatmap'),

    // financial health
    healthScore: () => request('/financial-health/score'),
    healthHistory: () => request('/financial-health/history'),

    // insights
    insights: () => request('/insights'),
    generateInsights: () => request('/insights/generate', { method: 'POST' }),
    weeklySummary: () => request('/insights/weekly-summary'),

    // predictions
    predictions: () => request('/predictions'),
  };
})();
