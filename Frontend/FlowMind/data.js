// FlowMind — mock data

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

  const transactions = [
    { id:'t01', merchant:'Taqueria El Sol',  cat:'food',     amt:-18.40, when:'Today · 8:42 PM',  note:'Tacos al pastor x3', card:'•• 4421' },
    { id:'t02', merchant:'Blue Bottle',      cat:'coffee',   amt:-6.25,  when:'Today · 9:14 AM',  note:'Oat latte',         card:'•• 4421' },
    { id:'t03', merchant:'Uber',             cat:'transport',amt:-14.80, when:'Today · 7:55 AM',  note:'Mission → SoMa',    card:'•• 4421' },
    { id:'t04', merchant:'Salary · Stripe',  cat:'income',   amt:+5840,  when:'Yesterday',         note:'Bi-weekly',         card:'Direct' },
    { id:'t05', merchant:'Trader Joe\'s',    cat:'food',     amt:-62.18, when:'Yesterday',         note:'Groceries',         card:'•• 4421' },
    { id:'t06', merchant:'Spotify',          cat:'fun',      amt:-10.99, when:'Yesterday',         note:'Premium',           card:'•• 4421' },
    { id:'t07', merchant:'CVS Pharmacy',     cat:'health',   amt:-23.50, when:'May 17',            note:'Vitamins',          card:'•• 4421' },
    { id:'t08', merchant:'Amazon',           cat:'shopping', amt:-89.00, when:'May 17',            note:'Desk lamp',         card:'•• 4421' },
    { id:'t09', merchant:'BART',             cat:'transport',amt:-4.50,  when:'May 16',            note:'Daly City',         card:'•• 4421' },
    { id:'t10', merchant:'Sweetgreen',       cat:'food',     amt:-16.20, when:'May 16',            note:'Harvest bowl',      card:'•• 4421' },
    { id:'t11', merchant:'PG&E',             cat:'bills',    amt:-78.40, when:'May 15',            note:'Electric',          card:'•• 4421' },
    { id:'t12', merchant:'Apple',            cat:'shopping', amt:-129.00,when:'May 14',            note:'AppleCare',         card:'•• 4421' },
    { id:'t13', merchant:'Equinox',          cat:'health',   amt:-185.00,when:'May 13',            note:'Monthly',           card:'•• 4421' },
    { id:'t14', merchant:'Delta Airlines',   cat:'travel',   amt:-342.00,when:'May 11',            note:'SFO → JFK',         card:'•• 4421' },
  ];

  // Last 7 days spending (Mon..Sun in display order)
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekSpend = [62, 38, 91, 54, 184, 122, 78]; // Fridays spike

  // Last 12 weeks balance trend
  const balanceTrend = [4120, 3980, 4310, 4220, 4480, 4310, 4690, 4550, 4720, 4880, 5040, 5380];

  // Category breakdown for the week (sums to ~spent this week)
  const breakdown = [
    { cat:'food',     amt: 198 },
    { cat:'transport',amt:  74 },
    { cat:'shopping', amt: 218 },
    { cat:'fun',      amt:  88 },
    { cat:'bills',    amt: 156 },
    { cat:'health',   amt: 208 },
    { cat:'coffee',   amt:  47 },
  ];

  const insights = [
    { id:'i1', tone:'warn',  title:'You spend more on Fridays',
      body:'Fridays average $184 — nearly 3× your weekly median. Mostly delivery & rideshare.',
      action:'See pattern' },
    { id:'i2', tone:'good',  title:'Saved 12% more this week',
      body:'Groceries down $46 vs last week. Keep cooking Sundays — it works.',
      action:'Lock this in' },
    { id:'i3', tone:'info',  title:'Subscription drift detected',
      body:'3 subscriptions auto-renewed this month and were used <2×. Want to pause?',
      action:'Review 3' },
    { id:'i4', tone:'good',  title:'On pace for Tokyo goal',
      body:'You\'re $312 ahead of schedule. At this rate, you\'ll hit it 3 weeks early.',
      action:'Adjust goal' },
  ];

  const goals = [
    { id:'g1', label:'Tokyo trip',   target:3500, saved:2140, icon:'✈', tint:'#22D3EE' },
    { id:'g2', label:'Emergency',    target:8000, saved:6320, icon:'⛨',  tint:'#10D9A3' },
    { id:'g3', label:'New camera',   target:1200, saved: 380, icon:'◉',  tint:'#A855F7' },
  ];

  const challenges = [
    { id:'c1', label:'No-spend Sunday',     reward:50,  progress:3, total:4, locked:false },
    { id:'c2', label:'Coffee under $20/wk', reward:30,  progress:11,total:14,locked:false },
    { id:'c3', label:'Cook 5 dinners',      reward:75,  progress:5, total:5, locked:false, done:true },
    { id:'c4', label:'Beat last week\'s budget', reward:100, progress:0, total:1, locked:true },
  ];

  const badges = [
    { id:'b1', name:'First Save',    icon:'◆', unlocked:true,  tint:'#10D9A3' },
    { id:'b2', name:'Streak 7',      icon:'🔥', unlocked:true,  tint:'#FF8A65' },
    { id:'b3', name:'Streak 30',     icon:'🔥', unlocked:true,  tint:'#FF5BA8' },
    { id:'b4', name:'Saver +10%',    icon:'▲', unlocked:true,  tint:'#4F7CFF' },
    { id:'b5', name:'Subscription Slayer', icon:'⚔', unlocked:false, tint:'#A855F7' },
    { id:'b6', name:'Goal Crusher',  icon:'★', unlocked:false, tint:'#FFB547' },
  ];

  return {
    categories, transactions, weekDays, weekSpend, balanceTrend, breakdown,
    insights, goals, challenges, badges,
    balance: 2340.18,
    income:  5840,
    spentWk:  989.20,
    weeklyBudget: 1400,
    healthScore: 78,
    healthDelta: +4,
    streak: 12,
    xp: 1340,
    xpToNext: 2000,
    level: 7,
    name: 'Alex',
  };
})();
