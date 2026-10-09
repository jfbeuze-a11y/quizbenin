import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useApp, type Route } from '../app/context';
import { Icon } from '../components/Icon';
import { Overlay } from '../components/ui';
import { CARDS, THEMES, UNIVERSES } from '../data/catalog';
import { pickSeries, recordAnswer, type Prepared } from '../engine/adaptive';
import { finishSeries, type AnswerLog } from '../engine/rewards';
import { sfx, speak, stopSpeaking } from '../engine/fx';
import { getState, setState, universeOf, useActiveProfile } from '../store/state';

const KEYS = ['A', 'B', 'C', 'D'];
const RESERVE = 3;

export function Quiz({ route }: { route: Extract<Route, { name: 'quiz' }> }) {
  const { go, celebrate } = useApp();
  const profile = useActiveProfile()!;
  const universe = universeOf(profile);
  const info = UNIVERSES[universe];
  const settings = profile.settings;
  const n = route.n ?? 10;
  const fixedSeries = route.mode === 'daily' || route.mode === 'duel';

  // Série tirée une seule fois au montage, plus quelques questions de réserve pour le joker « passer ».
  const initial = useMemo(() => {
    const s = getState();
    const p = s.profiles.find((x) => x.id === s.activeId)!;
    const all = pickSeries({ profile: p, qstats: s.qstats, mode: route.mode, n: fixedSeries ? n : n + RESERVE, theme: route.theme, dept: route.dept, seed: route.seed });
    return { series: all.slice(0, n), reserve: all.slice(n) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [series, setSeries] = useState<Prepared[]>(initial.series);
  const reserve = useRef(initial.reserve);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [removed, setRemoved] = useState<number[]>([]);
  const [log, setLog] = useState<AnswerLog[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(info.timer);
  const [timeMax, setTimeMax] = useState<number | null>(info.timer);
  const [newCard, setNewCard] = useState<string | null>(null);
  const [quitAsk, setQuitAsk] = useState(false);
  const askedAt = useRef(performance.now());

  const cur = series[idx];
  const praise = useMemo(() => pickOne(['Excellent !', 'Bien vu !', 'Exact !', 'Bravo !']), [idx]);
  const revealed = chosen !== null;
  const isVF = cur?.choices.length === 2 && cur.choices[0] === 'Vrai';

  // Lecture audio (indispensable pour les Petits explorateurs).
  useEffect(() => {
    if (cur && settings.autoRead) speak(`${cur.q.text} ${cur.choices.join(', ')}`);
    return stopSpeaking;
  }, [idx, cur, settings.autoRead]);

  // Minuteur
  useEffect(() => {
    if (revealed || timeLeft === null || quitAsk) return;
    if (timeLeft <= 0) {
      answer(-1);
      return;
    }
    const id = setTimeout(() => {
      setTimeLeft((t) => (t === null ? t : t - 1));
      if (timeLeft <= 6) sfx.tick(settings);
    }, 1000);
    return () => clearTimeout(id);
  }, [timeLeft, revealed, quitAsk]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = useCallback(
    (i: number) => {
      if (revealed || !cur) return;
      const ok = i === cur.answer;
      const ms = performance.now() - askedAt.current;
      setChosen(i);
      stopSpeaking();
      if (ok) {
        sfx.good(settings);
        celebrate();
      } else sfx.bad(settings);

      let earnedCard: string | null = null;
      setState((s) => {
        const p = s.profiles.find((x) => x.id === s.activeId);
        if (!p) return;
        recordAnswer(p, s.qstats, cur.q, ok);
        const th = cur.q.theme;
        p.stats.answered += 1;
        p.stats.themeAnswered[th] = (p.stats.themeAnswered[th] ?? 0) + 1;
        if (ok) {
          p.stats.correct += 1;
          p.stats.themeCorrect[th] = (p.stats.themeCorrect[th] ?? 0) + 1;
          if (th === 'histoire' && cur.q.dept === 'zou') p.stats.danhomeCorrect += 1;
          if (cur.q.card && !p.cards.includes(cur.q.card)) earnedCard = cur.q.card;
        }
      });
      setNewCard(earnedCard);
      setLog((l) => [...l, { qid: cur.q.id, ok, ms }]);
      if (settings.autoRead) speak((ok ? 'Bravo ! ' : 'Pas tout à fait. ') + cur.q.explain);
    },
    [cur, revealed, settings, celebrate]
  );

  const next = useCallback(() => {
    stopSpeaking();
    if (idx + 1 >= series.length) {
      let summary!: ReturnType<typeof finishSeries>;
      setState((s) => {
        const p = s.profiles.find((x) => x.id === s.activeId)!;
        summary = finishSeries(p, route.mode, log, route.dept);
      });
      if (summary.correct >= Math.ceil(summary.total * 0.7)) sfx.win(settings);
      go({ name: 'results', summary, mode: route.mode, title: route.title, dept: route.dept, seed: route.seed });
      return;
    }
    setIdx(idx + 1);
    setChosen(null);
    setRemoved([]);
    setNewCard(null);
    setTimeLeft(info.timer);
    setTimeMax(info.timer);
    askedAt.current = performance.now();
  }, [idx, series.length, log, route, go, info.timer, settings]);

  // Clavier : 1-4 ou A-D pour répondre, Entrée pour continuer (pratique en mode classe).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (quitAsk) return;
      if (revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
        return;
      }
      const k = e.key.toUpperCase();
      const i = /^[1-4]$/.test(k) ? Number(k) - 1 : KEYS.indexOf(k);
      if (!revealed && i >= 0 && i < (cur?.choices.length ?? 0) && !removed.includes(i)) answer(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, next, answer, cur, removed, quitAsk]);

  const playJoker = (kind: 'fifty' | 'time' | 'skip') => {
    if (profile.jokers[kind] <= 0 || revealed) return;
    sfx.tap(settings);
    if (kind === 'fifty') {
      const wrong = cur.choices.map((_, i) => i).filter((i) => i !== cur.answer);
      const drop = wrong.sort(() => Math.random() - 0.5).slice(0, cur.choices.length >= 4 ? 2 : 1);
      setRemoved(drop);
    }
    if (kind === 'time') {
      setTimeLeft((t) => (t === null ? t : t + 15));
      setTimeMax((m) => (m === null ? m : Math.max(m, (timeLeft ?? 0) + 15)));
    }
    if (kind === 'skip') {
      const repl = reserve.current.shift();
      if (!repl) return;
      setSeries((s) => s.map((x, i) => (i === idx ? repl : x)));
      setRemoved([]);
      setTimeLeft(info.timer);
      setTimeMax(info.timer);
      askedAt.current = performance.now();
    }
    setState((s) => {
      const p = s.profiles.find((x) => x.id === s.activeId);
      if (p) p.jokers[kind] -= 1;
    });
  };

  if (!cur) {
    return (
      <div className="screen full">
        <p>Aucune question disponible pour le moment.</p>
        <button className="btn btn-primary" onClick={() => go({ name: 'home' })}>
          Retour
        </button>
      </div>
    );
  }

  const theme = THEMES[cur.q.theme];
  const ok = chosen === cur.answer;
  const pct = timeLeft !== null && timeMax ? timeLeft / timeMax : 1;
  const C = 2 * Math.PI * 22;

  return (
    <div className="quiz">
      <div className="quiz-head">
        <button className="icon-btn" onClick={() => setQuitAsk(true)} aria-label="Quitter la partie">
          <Icon name="close" />
        </button>
        <div className="segments" aria-label={`Question ${idx + 1} sur ${series.length}`}>
          {series.map((_, i) => (
            <i key={i} className={i < log.length ? (log[i].ok ? 'ok' : 'ko') : i === idx ? 'now' : ''} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '.85rem', color: 'var(--ink-2)', minWidth: 40, textAlign: 'right' }}>
          {idx + 1}/{series.length}
        </span>
      </div>

      <div className="quiz-body" key={cur.q.id}>
        <div className="q-meta">
          <span className="theme-chip" style={{ '--c': theme.color } as CSSProperties}>
            <span aria-hidden="true">{theme.icon}</span> {theme.label}
          </span>
          {timeLeft !== null && (
            <div className={`timer ${pct <= 0.25 ? 'danger' : pct <= 0.5 ? 'warn' : ''}`} role="timer" aria-label={`${timeLeft} secondes restantes`}>
              <svg viewBox="0 0 52 52">
                <circle className="track" cx="26" cy="26" r="22" />
                <circle className="run" cx="26" cy="26" r="22" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
              </svg>
              <b>{Math.max(0, timeLeft)}</b>
            </div>
          )}
        </div>

        <div className="q-card">
          {cur.q.img && (
            <div className="q-img" aria-hidden="true">
              {cur.q.img}
            </div>
          )}
          <div className="q-text" id="qtext">
            {cur.q.text}
          </div>
          <button className="listen" onClick={() => speak(`${cur.q.text} ${cur.choices.join(', ')}`)}>
            <Icon name="volume" /> Écouter
          </button>
        </div>

        <div className={`choices ${isVF ? 'vf' : ''}`} role="group" aria-labelledby="qtext">
          {cur.choices.map((c, i) => {
            const cls = revealed ? (i === cur.answer ? 'right' : i === chosen ? 'wrong' : 'dim') : removed.includes(i) ? 'gone' : '';
            return (
              <button key={i} className={`choice ${cls}`} onClick={() => answer(i)} disabled={revealed || removed.includes(i)}>
                <span className="key" aria-hidden="true">
                  {KEYS[i]}
                </span>
                <span>{c}</span>
                <span className="mark">{revealed && i === cur.answer ? <Icon name="check" title="Bonne réponse" /> : revealed && i === chosen ? <Icon name="x" title="Ta réponse" /> : null}</span>
              </button>
            );
          })}
        </div>

        {!revealed && universe !== 'petits' && (
          <div className="jokers" aria-label="Jokers">
            <button className="joker" onClick={() => playJoker('fifty')} disabled={profile.jokers.fifty <= 0 || isVF || cur.choices.length < 3 || removed.length > 0}>
              <Icon name="half" /> 50/50 <sup>×{profile.jokers.fifty}</sup>
            </button>
            {timeLeft !== null && (
              <button className="joker" onClick={() => playJoker('time')} disabled={profile.jokers.time <= 0}>
                <Icon name="clock" /> +15 s <sup>×{profile.jokers.time}</sup>
              </button>
            )}
            {!fixedSeries && (
              <button className="joker" onClick={() => playJoker('skip')} disabled={profile.jokers.skip <= 0 || reserve.current.length === 0}>
                <Icon name="skip" /> Passer <sup>×{profile.jokers.skip}</sup>
              </button>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <div className={`sheet ${ok ? 'ok' : 'ko'}`} role="region" aria-live="polite" aria-label="Correction">
          <div className="verdict">
            <span className="badge">
              <Icon name={ok ? 'check' : 'x'} />
            </span>
            <h3>{ok ? praise : chosen === -1 ? 'Temps écoulé' : 'Pas tout à fait'}</h3>
          </div>
          {!ok && (
            <p style={{ fontWeight: 800 }}>
              Réponse : {cur.choices[cur.answer]}
            </p>
          )}
          <p>{cur.q.explain}</p>
          {cur.q.anecdote && universe === 'champions' && (
            <div className="anecdote">
              <b>Le sais-tu ?</b>
              <span>{cur.q.anecdote}</span>
            </div>
          )}
          {newCard && CARDS[newCard] && (
            <div className="new-card">
              <span style={{ fontSize: '1.6rem' }}>{CARDS[newCard].emoji}</span>
              Nouvelle carte : {CARDS[newCard].name}
            </div>
          )}
          <button className="btn btn-primary btn-block" onClick={next} autoFocus style={{ marginTop: 8 }}>
            {idx + 1 >= series.length ? 'Voir mon score' : 'Continuer'}
          </button>
        </div>
      )}

      {quitAsk && (
        <Overlay label="Quitter la partie" onBackdrop={() => setQuitAsk(false)}>
          <div className="modal">
            <h3>Quitter la partie ?</h3>
            <p>Les réponses déjà données comptent pour ta progression, mais tu ne gagneras pas les récompenses de la série.</p>
            <div className="row-gap">
              <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>
                Quitter
              </button>
              <button className="btn btn-primary" onClick={() => setQuitAsk(false)} autoFocus>
                Continuer
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

const pickOne = (a: string[]) => a[Math.floor(Math.random() * a.length)];
