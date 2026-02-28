import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ target, suffix = '', duration = 1.2 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target]);
  return <>{display}{suffix}</>;
}

// ─── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart({ authPct, anonPct, auth, anon }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const authLen = animated ? (authPct / 100) * circ : 0;
  const anonLen = animated ? (anonPct / 100) * circ : 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
          {/* Anon (gold) */}
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--gold)" strokeWidth="14"
            strokeDasharray={`${anonLen} ${circ}`}
            strokeDashoffset={-authLen}
            strokeLinecap="butt"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1) 0.5s' }}
          />
          {/* Auth (navy) */}
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--navy)" strokeWidth="14"
            strokeDasharray={`${authLen} ${circ}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display font-bold text-xl leading-none" style={{ color: 'var(--navy)' }}>{authPct}%</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>auth'd</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 flex-shrink-0" style={{ background: 'var(--navy)' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{auth}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Authenticated</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 flex-shrink-0" style={{ background: 'var(--gold)' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{anon}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Anonymous</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trend bar chart ──────────────────────────────────────────────────────────
function TrendChart({ data }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const max = Math.max(...data.map(d => d.count), 1);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-32 relative">
        {/* Y-axis ghost lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => (
          <div key={frac} className="absolute w-full border-t pointer-events-none"
            style={{ bottom: `${frac * 100}%`, borderColor: 'rgba(0,0,0,0.05)' }} />
        ))}

        {data.map((d, i) => {
          const heightPct = max > 0 ? (d.count / max) * 100 : 0;
          const isToday = d.date === today;
          const dow = new Date(d.date + 'T12:00:00').getDay();
          const isWeekend = dow === 0 || dow === 6;
          const barColor = isToday ? 'var(--gold)' : isWeekend ? 'rgba(15,37,87,0.2)' : 'var(--navy)';

          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center group relative"
              style={{ height: '100%' }}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Tooltip */}
              {tooltip === i && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white rounded whitespace-nowrap z-20 pointer-events-none"
                  style={{ background: 'var(--ink)' }}>
                  {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' '}· {d.count} conv{d.count !== 1 ? 's' : ''}
                </div>
              )}
              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-sm cursor-pointer transition-opacity duration-150"
                  style={{
                    height: animated ? `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%` : '0%',
                    minHeight: d.count > 0 ? 3 : 0,
                    background: barColor,
                    transition: `height 0.65s cubic-bezier(0.4,0,0.2,1) ${i * 25}ms`,
                    opacity: tooltip === null ? 1 : tooltip === i ? 1 : 0.45,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 text-center" style={{ fontSize: 9 }}>
            {(i === 0 || i % 4 === 0 || i === data.length - 1) && (
              <span style={{ color: 'var(--text-muted)' }}>
                {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal topic bar ──────────────────────────────────────────────────────
function TopicBar({ topic, count, maxCount, total, index }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100 + index * 55); return () => clearTimeout(t); }, [index]);

  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const sharePct = total > 0 ? Math.round((count / total) * 100) : 0;

  const COLORS = {
    housing: '#1d4ed8', economy: '#0f2557', parks: '#16a34a',
    education: '#7c3aed', environment: '#059669', 'local-business': '#b45309',
    infrastructure: '#0369a1', taxes: '#dc2626', 'public-safety': '#6d28d9',
    'civil-rights': '#0f766e', transportation: '#1e40af', immigration: '#9d174d',
  };
  const color = COLORS[topic] || 'var(--navy)';

  return (
    <div className="group cursor-default" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 flex-shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
            style={{ background: color }} />
          <span className="text-sm font-medium capitalize transition-colors duration-150"
            style={{ color: hovered ? color : 'var(--navy)' }}>
            {topic.replace(/-/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums transition-colors duration-150" style={{ color: hovered ? color : 'var(--text-muted)' }}>
            {sharePct}% of topics
          </span>
          <span className="text-sm font-bold tabular-nums w-6 text-right" style={{ color: 'var(--navy)' }}>{count}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full origin-left"
          style={{
            width: animated ? `${pct}%` : '0%',
            background: color,
            transition: `width 0.85s cubic-bezier(0.4,0,0.2,1) ${100 + index * 55}ms`,
            opacity: hovered ? 1 : 0.7,
          }}
        />
      </div>
    </div>
  );
}

// ─── Gauge ────────────────────────────────────────────────────────────────────
function EngagementGauge({ rate }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);

  const color = rate >= 75 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626';
  const label = rate >= 75 ? 'Excellent' : rate >= 50 ? 'Moderate' : 'Low';
  // arc length for a semi-circle path length ~150.8
  const arcLen = 150.8;
  const filled = animated ? (rate / 100) * arcLen : 0;
  const needleDeg = animated ? (rate / 100) * 180 - 90 : -90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 120, height: 66 }}>
        <svg width="120" height="66" viewBox="0 0 120 66">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round"/>
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${filled} ${arcLen}`}
            style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.4,0,0.2,1) 0.5s' }}
          />
        </svg>
        <div className="absolute bottom-1 left-1/2 w-0.5 h-10 origin-bottom"
          style={{
            background: color,
            transform: `translateX(-50%) rotate(${needleDeg}deg)`,
            transition: 'transform 1.3s cubic-bezier(0.4,0,0.2,1) 0.5s',
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: color }} />
      </div>
      <div className="text-center mt-1">
        <div className="font-display text-2xl font-bold" style={{ color }}>{rate}%</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label} Completion</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAnalytics({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/candidate/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-24 card" style={{ background: 'var(--border)' }} />)}
      </div>
    );
  }

  const {
    total_conversations: total,
    authenticated_conversations: auth,
    anonymous_conversations: anon,
    unique_constituents: unique,
    avg_messages_per_conversation: avgMsg,
    completion_rate,
    top_questions,
    daily_trend,
  } = data;

  const authPct = total > 0 ? Math.round((auth / total) * 100) : 0;
  const anonPct = 100 - authPct;
  const topicTotal = top_questions?.reduce((s, q) => s + q.count, 0) || 1;
  const maxCount = top_questions?.[0]?.count || 1;

  // Trend delta: last 7 vs prior 7 days
  const trendDelta = (() => {
    if (!daily_trend || daily_trend.length < 14) return null;
    const last7 = daily_trend.slice(-7).reduce((s, d) => s + d.count, 0);
    const prev7 = daily_trend.slice(0, 7).reduce((s, d) => s + d.count, 0);
    return last7 - prev7;
  })();

  return (
    <div className="space-y-7">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: total, sub: 'all time', accent: 'var(--navy)' },
          { label: 'Unique Voters', value: unique, sub: 'distinct constituents', accent: 'var(--gold)' },
          { label: 'Avg Messages', value: parseFloat(avgMsg), sub: 'per session', accent: '#16a34a' },
          { label: 'Completion Rate', value: completion_rate || 0, sub: 'sessions ended', accent: '#7c3aed', suffix: '%' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="card p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.accent }} />
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--navy)' }}>
              <CountUp target={s.value} suffix={s.suffix || ''} />
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* 14-day trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="section-label mb-1">Activity Trend</p>
            <h3 className="font-display text-base font-semibold" style={{ color: 'var(--navy)' }}>
              Conversations — last 14 days
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            {trendDelta !== null && (
              <span className="text-sm font-semibold" style={{ color: trendDelta >= 0 ? '#16a34a' : '#dc2626' }}>
                {trendDelta >= 0 ? '↑' : '↓'} {Math.abs(trendDelta)} vs. prior week
              </span>
            )}
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: 'var(--navy)' }} /> Weekday</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 inline-block" style={{ background: 'var(--gold)' }} /> Today</span>
            </div>
          </div>
        </div>
        {daily_trend && <TrendChart data={daily_trend} />}
      </motion.div>

      {/* Topics + Donut/Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="lg:col-span-2 card p-6">
          <p className="section-label mb-1">Issue Intelligence</p>
          <h3 className="font-display text-base font-semibold mb-6" style={{ color: 'var(--navy)' }}>
            What voters are asking about
          </h3>
          {top_questions?.length > 0 ? (
            <div className="space-y-4">
              {top_questions.map((q, i) => (
                <TopicBar key={q.topic} topic={q.topic} count={q.count} maxCount={maxCount} total={topicTotal} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No conversations yet.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="card p-6 flex flex-col gap-8">
          <div>
            <p className="section-label mb-1">Audience</p>
            <h3 className="font-display text-sm font-semibold mb-5" style={{ color: 'var(--navy)' }}>Auth vs. Anonymous</h3>
            <DonutChart authPct={authPct} anonPct={anonPct} auth={auth} anon={anon} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <p className="section-label mb-1">Engagement</p>
            <h3 className="font-display text-sm font-semibold mb-5" style={{ color: 'var(--navy)' }}>Completion rate</h3>
            <EngagementGauge rate={completion_rate || 0} />
          </div>
        </motion.div>
      </div>

      {/* AI Insights strip */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
        className="card p-6" style={{ borderLeft: '3px solid var(--gold)' }}>
        <p className="section-label mb-2">AI Summary</p>
        <h3 className="font-display text-base font-semibold mb-5" style={{ color: 'var(--navy)' }}>What the data tells you</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📊',
              title: 'Top concern',
              body: top_questions?.[0]
                ? `"${top_questions[0].topic.replace(/-/g, ' ')}" leads all topics at ${Math.round((top_questions[0].count / topicTotal) * 100)}% of conversations. Consider a dedicated FAQ or position paper.`
                : 'No topics yet.',
            },
            {
              icon: '📈',
              title: 'Engagement trend',
              body: trendDelta === null ? 'Need more data.'
                : trendDelta > 0 ? `Up ${trendDelta} conversation${trendDelta !== 1 ? 's' : ''} vs. the prior 7 days. Momentum is building — keep it going.`
                : trendDelta < 0 ? `Down ${Math.abs(trendDelta)} vs. prior 7 days. A social media push or canvassing event could reverse this.`
                : 'Consistent pace week over week. Steady engagement.',
            },
            {
              icon: '👥',
              title: 'Audience signal',
              body: authPct >= 60
                ? `${authPct}% of voters identified themselves — strong signal. These high-intent constituents are prime canvassing targets.`
                : `${anonPct}% are browsing anonymously. A post-chat email prompt could convert more to identified supporters.`,
            },
          ].map((item, i) => (
            <div key={i}>
              <div className="text-xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--navy)' }}>{item.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
