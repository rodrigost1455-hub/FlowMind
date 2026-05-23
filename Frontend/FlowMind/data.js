// FlowMind — base data
//
// Categories + badge / challenge definitions stay (they're taxonomy, not
// user content). Everything else starts blank so a freshly-onboarded user
// sees zeros until they log their own transactions and goals.

window.MOCK = (() => {
  const categories = {
    food:     { id:'food',     label:'Food',          icon:'🍜', color:'#FF8A65', soft:'rgba(255,138,101,0.16)' },
    coffee:   { id:'coffee',   label:'Coffee',        icon:'☕', color:'#B97A56', soft:'rgba(185,122,86,0.18)' },
    transport:{ id:'transport',label:'Transport',     icon:'🚇', color:'#4F7CFF', soft:'rgba(79,124,255,0.18)' },
    shopping: { id:'shopping', label:'Shopping',      icon:'🛍', color:'#A855F7', soft:'rgba(168,85,247,0.18)' },
    rent:     { id:'rent',     label:'Rent',          icon:'🏠', color:'#34D399', soft:'rgba(52,211,153,0.18)' },
    health:   { id:'health',   label:'Health',        icon:'✚',  color:'#FF6B7A', soft:'rgba(255,107,122,0.18)' },
    fun:      { id:'fun',      label:'Fun',           icon:'🎧', color:'#FF5BA8', soft:'rgba(255,91,168,0.18)' },
    bills:    { id:'bills',    label:'Bills',         icon:'⚡', color:'#FFB547', soft:'rgba(255,181,71,0.18)' },
    income:   { id:'income',   label:'Income',        icon:'↓',  color:'#10D9A3', soft:'rgba(16,217,163,0.18)' },
    travel:   { id:'travel',   label:'Travel',        icon:'✈',  color:'#22D3EE', soft:'rgba(34,211,238,0.18)' },
  };

  // No sample transactions — user-logged only.
  const transactions = [];

  // Week labels are pure presentation; values stay flat at 0 until the user
  // logs spending. Sparkline math has a `|| 1` guard for max-min, so an
  // all-zero array renders as a flat baseline rather than crashing.
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekSpend = [0, 0, 0, 0, 0, 0, 0];

  // 12-week balance trend — all zeros until real data accumulates.
  const balanceTrend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // No category breakdown until the first expense is logged.
  const breakdown = [];

  // No AI insights until enough activity exists.
  const insights = [];

  // No goals until the user creates one.
  const goals = [];

  // No active challenges until the user starts one. Definitions live in the
  // NewGoalModal "presets" list — not here.
  const challenges = [];

  // Badge catalogue stays — all locked until the user earns them.
  const badges = [
    { id:'b1', name:'First Save',           icon:'◆', unlocked:false, tint:'#10D9A3' },
    { id:'b2', name:'Streak 7',             icon:'🔥', unlocked:false, tint:'#FF8A65' },
    { id:'b3', name:'Streak 30',            icon:'🔥', unlocked:false, tint:'#FF5BA8' },
    { id:'b4', name:'Saver +10%',           icon:'▲', unlocked:false, tint:'#4F7CFF' },
    { id:'b5', name:'Subscription Slayer',  icon:'⚔', unlocked:false, tint:'#A855F7' },
    { id:'b6', name:'Goal Crusher',         icon:'★', unlocked:false, tint:'#FFB547' },
  ];

  return {
    categories, transactions, weekDays, weekSpend, balanceTrend, breakdown,
    insights, goals, challenges, badges,

    // Profile defaults — get overwritten by /auth/me after login.
    name: '',
    email: '',

    // Money state — all blank.
    balance: 0,
    income:  0,
    saved:   0,
    spentWk: 0,
    weeklyBudget: 0,

    // Health / gamification state.
    healthScore: 0,
    healthDelta: 0,
    streak: 0,
    xp: 0,
    xpToNext: 1000,   // first-level threshold so the XP bar maths doesn't divide by 0
    level: 1,
  };
})();
