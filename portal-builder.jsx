/* AI Game Builder — prompt → game via Claude */

const SUGGESTIONS = [
  { emoji: '🐍', label: 'Snake game', prompt: 'A classic Snake game where I control a snake with arrow keys to eat apples and grow longer. Game over when I hit a wall or myself.' },
  { emoji: '🏓', label: 'Pong', prompt: 'A 2-player Pong game. Left player uses W/S, right player uses arrow keys. First to 5 points wins.' },
  { emoji: '🧠', label: 'Quiz: capitals', prompt: 'A multiple-choice quiz game about world capitals. 10 questions, score at the end, with fun celebration on each correct answer.' },
  { emoji: '🃏', label: 'Memory match', prompt: 'A memory card matching game with emoji pairs. Flip two cards at a time to find matches. Timer and move counter.' },
  { emoji: '⚡', label: 'Reaction speed', prompt: 'A reaction-speed game. A button changes color randomly; click as fast as you can when it turns green. Track best time.' },
  { emoji: '🚀', label: 'Space dodger', prompt: 'A simple space game where I move a rocket left/right to dodge falling asteroids. Track how long I survive.' },
  { emoji: '🎯', label: 'Whack-a-mole', prompt: 'A whack-a-mole game with 9 holes. Click moles before they disappear. 30-second timer and final score.' },
  { emoji: '🎨', label: 'Drawing app', prompt: 'A simple drawing app with a canvas, color picker, brush size slider, and a clear button.' },
];

const SYSTEM_PROMPT = `You are a game generator for Champ Code Academy, a coding platform for kids 7-15. Generate a complete, self-contained, playable HTML5 game based on the user's description.

REQUIREMENTS:
- Return ONLY a single complete HTML document, no explanation, no markdown code fences.
- All CSS and JavaScript must be inline.
- Must fit in a 640x480 iframe (size your canvas/layout for that).
- Use these colors where appropriate: #3DB896 (green), #ED7559 (orange), #957FE8 (purple), #EAF5FC (light blue bg), #FDF7E3 (cream).
- Use rounded corners (border-radius: 12px+) and a fun, bright, kid-friendly style.
- Use 'Nunito' or system-ui fonts. Include a Google Fonts link if you want.
- Include a short title at the top, the game, and a score/state display.
- Game must work immediately on load — no setup screen unless essential.
- Keep it simple, fun, and playable. Code should be solid and tested mentally.

USER PROMPT:`;

const BuilderPage = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [game, setGame] = useState(null); // { id, title, prompt, html, createdAt }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedGames, setSavedGames] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef(null);

  // Load saved games
  useEffect(() => {
    try {
      const raw = localStorage.getItem('champ_saved_games');
      if (raw) setSavedGames(JSON.parse(raw));
    } catch {}
  }, []);

  const persistSaved = (next) => {
    setSavedGames(next);
    try { localStorage.setItem('champ_saved_games', JSON.stringify(next)); } catch {}
  };

  const generate = async (text) => {
    const p = (text || prompt).trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    setShowCode(false);
    setGame(null);
    try {
      const raw = await window.claude.complete(SYSTEM_PROMPT + '\n' + p);
      // Strip possible markdown fences
      let html = raw.trim();
      if (html.startsWith('```')) {
        html = html.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
      }
      // If response doesn't start with html doctype/tag, try to find it
      const htmlMatch = html.match(/<!DOCTYPE[\s\S]*<\/html>/i) || html.match(/<html[\s\S]*<\/html>/i);
      if (htmlMatch) html = htmlMatch[0];
      // Derive a title from the prompt
      const title = p.length > 40 ? p.slice(0, 40) + '…' : p;
      setGame({ id: Date.now(), title, prompt: p, html, createdAt: Date.now() });
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!game) return;
    const next = [game, ...savedGames.filter(g => g.id !== game.id)].slice(0, 12);
    persistSaved(next);
  };

  const deleteSaved = (id) => {
    persistSaved(savedGames.filter(g => g.id !== id));
  };

  const loadSaved = (g) => {
    setGame(g);
    setPrompt(g.prompt);
    setShowCode(false);
  };

  const refreshIframe = () => {
    if (iframeRef.current && game) {
      iframeRef.current.srcdoc = game.html;
    }
  };

  const isSaved = game && savedGames.some(g => g.id === game.id);

  return (
    <div>
      <PageHeader
        title={<span>AI Game Builder <span style={{ background: 'linear-gradient(90deg, #957FE8, #ED7559)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>✨</span></span>}
        subtitle="Describe a game in your own words — AI will build it for you. Then play, share, or remix."
        right={
          <Pill color="#957FE8" filled style={{ padding: '8px 16px', fontSize: 12 }}>
            <Icon name="sparkles" size={14} stroke="#fff" /> Powered by AI
          </Pill>
        }
      />

      {/* Main builder area */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, marginBottom: 32 }}>
        {/* LEFT — Prompt panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #957FE8, #ED7559)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="sparkles" size={18} stroke="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Fredoka', fontSize: 16, fontWeight: 600, color: '#1a2942' }}>Describe your game</h3>
                <p style={{ fontSize: 12, color: '#6c7f95' }}>Be specific — colors, rules, goal!</p>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A game where I'm a fox catching falling stars with a basket. Use arrow keys. 30-second timer."
              style={{
                width: '100%', minHeight: 110, padding: 14,
                border: '2px solid #e3edf5', borderRadius: 12,
                fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#1a2942',
                resize: 'vertical', outline: 'none', background: '#f9fbfd',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#957FE8'}
              onBlur={e => e.currentTarget.style.borderColor = '#e3edf5'}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 10 }}>
              <span style={{ fontFamily: 'Fira Code', fontSize: 11, color: '#a3b5c8', fontWeight: 600 }}>
                {prompt.length} chars
              </span>
              <Btn
                color="#957FE8"
                size="md"
                icon={loading ? null : 'sparkles'}
                onClick={() => generate()}
                disabled={loading || !prompt.trim()}
              >
                {loading ? 'Building…' : 'Generate Game'}
              </Btn>
            </div>
          </Card>

          {/* Suggestion chips */}
          <Card style={{ padding: 18 }}>
            <h4 style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942', marginBottom: 12 }}>💡 Try one of these</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => { setPrompt(s.prompt); }} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 99,
                  background: '#f5f8fb', border: '1.5px solid #e3edf5',
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
                  color: '#1a2942', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EAF5FC'; e.currentTarget.style.borderColor = '#957FE8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f5f8fb'; e.currentTarget.style.borderColor = '#e3edf5'; }}
                >
                  <span style={{ fontSize: 14 }}>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Tip card */}
          <Card style={{ padding: 16, background: '#FDF7E3', border: '1px solid #f0e4b5' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💡</span>
              <div>
                <h4 style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942', marginBottom: 4 }}>Pro tip</h4>
                <p style={{ fontSize: 12, color: '#a07f4a', lineHeight: 1.5 }}>
                  The more details you give, the better the game. Mention controls, goal, scoring, and colors!
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT — Preview area */}
        <Card style={{ padding: 0, overflow: 'hidden', minHeight: 580, display: 'flex', flexDirection: 'column' }}>
          {/* Preview toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px', borderBottom: '1px solid #eef3f8',
            background: '#fafcfe',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ED7559' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FDB52A' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#3DB896' }} />
            </div>
            <div style={{
              flex: 1, padding: '6px 14px', background: '#fff',
              borderRadius: 99, border: '1px solid #e3edf5',
              fontFamily: 'Fira Code', fontSize: 12, color: '#6c7f95',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {game ? (
                <>
                  <Icon name="sparkles" size={12} stroke="#957FE8" />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</span>
                </>
              ) : (
                <span>preview.champcode.local</span>
              )}
            </div>
            {game && (
              <>
                <button onClick={() => setShowCode(!showCode)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e3edf5',
                  background: showCode ? '#1a2942' : '#fff', color: showCode ? '#fff' : '#4a5e75',
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  <Icon name="code" size={14} />
                  {showCode ? 'Preview' : 'Code'}
                </button>
                <button onClick={refreshIframe} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e3edf5',
                  background: '#fff', color: '#4a5e75',
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  <Icon name="refresh" size={14} /> Restart
                </button>
              </>
            )}
          </div>

          {/* Preview body */}
          <div style={{ flex: 1, position: 'relative', background: '#EAF5FC', overflow: 'hidden' }}>
            {loading && <BuildingLoader />}

            {!loading && !game && !error && <EmptyPreview onSuggest={(p) => { setPrompt(p); generate(p); }} />}

            {!loading && error && (
              <div style={{
                padding: 40, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 14,
              }}>
                <div style={{ fontSize: 48 }}>😅</div>
                <h3 style={{ fontFamily: 'Fredoka', fontSize: 18, fontWeight: 600, color: '#1a2942' }}>Oops, that didn't work</h3>
                <p style={{ fontSize: 13, color: '#6c7f95', maxWidth: 320 }}>{error}</p>
                <Btn color="#957FE8" onClick={() => generate()}>Try again</Btn>
              </div>
            )}

            {!loading && game && !showCode && (
              <iframe
                ref={iframeRef}
                srcDoc={game.html}
                title={game.title}
                style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                sandbox="allow-scripts"
              />
            )}

            {!loading && game && showCode && (
              <pre style={{
                width: '100%', height: '100%', overflow: 'auto', margin: 0,
                padding: 20, background: '#1a2942', color: '#a3d5f4',
                fontFamily: 'Fira Code', fontSize: 12, lineHeight: 1.6,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{game.html}</pre>
            )}
          </div>

          {/* Preview footer — save bar */}
          {game && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderTop: '1px solid #eef3f8', gap: 12,
              background: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Pill color="#3DB896" filled size="sm">+50 XP earned</Pill>
                <span style={{ fontSize: 12, color: '#6c7f95', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {game.prompt}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Btn color="#957FE8" variant="outline" icon="refresh" size="sm" onClick={() => generate(game.prompt)}>Remix</Btn>
                <Btn color={isSaved ? '#3DB896' : '#ED7559'} icon={isSaved ? 'check' : 'heart'} size="sm" onClick={save} disabled={isSaved}>
                  {isSaved ? 'Saved!' : 'Save game'}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* My Games gallery */}
      <div>
        <SectionHeader title="🎮 My Saved Games" />
        {savedGames.length === 0 ? (
          <Card style={{ padding: 32, textAlign: 'center', background: '#fafcfe' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎮</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: 15, fontWeight: 600, color: '#1a2942', marginBottom: 4 }}>No saved games yet</h3>
            <p style={{ fontSize: 13, color: '#6c7f95' }}>Generate your first game above and save it to keep playing!</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {savedGames.map(g => (
              <Card key={g.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                  height: 130, background: 'linear-gradient(135deg, #EAF5FC, #FDF7E3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  borderBottom: '1px solid #e3edf5',
                }}>
                  {/* Mini iframe preview — pointer-events disabled so card click works */}
                  <iframe
                    srcDoc={g.html}
                    sandbox=""
                    style={{
                      width: 320, height: 240, border: 'none', pointerEvents: 'none',
                      transform: 'scale(0.4)', transformOrigin: 'center', background: '#fff',
                      borderRadius: 8, boxShadow: '0 4px 12px rgba(15,38,73,0.1)',
                    }}
                  />
                  <Pill color="#957FE8" filled size="sm" style={{ position: 'absolute', top: 8, left: 8 }}>
                    <Icon name="sparkles" size={10} stroke="#fff" /> AI
                  </Pill>
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</h4>
                  <p style={{ fontSize: 11, color: '#a3b5c8', marginBottom: 10, fontFamily: 'Fira Code', fontWeight: 600 }}>
                    {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn color="#3DB896" size="sm" icon="play" onClick={() => loadSaved(g)} style={{ flex: 1 }}>Play</Btn>
                    <button onClick={() => deleteSaved(g.id)} style={{
                      width: 32, height: 32, borderRadius: 99, border: '2px solid #e3edf5',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#a3b5c8',
                    }}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Building loader ─── */
const BuildingLoader = () => {
  const messages = [
    'Reading your idea...',
    'Sketching the game...',
    'Writing JavaScript...',
    'Adding colors...',
    'Testing for bugs...',
    'Almost done!',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, background: 'linear-gradient(135deg, #EAF5FC, #FDF7E3)',
    }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '4px solid #957FE830', borderTopColor: '#957FE8',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
        }}>✨</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Fredoka', fontSize: 18, fontWeight: 600, color: '#1a2942', marginBottom: 6 }}>Building your game</h3>
        <p key={idx} style={{ fontSize: 13, color: '#957FE8', fontFamily: 'Fira Code', fontWeight: 600, animation: 'fadeIn .4s' }}>{messages[idx]}</p>
      </div>
    </div>
  );
};

/* ─── Empty preview state ─── */
const EmptyPreview = ({ onSuggest }) => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 18, textAlign: 'center',
  }}>
    <div style={{
      width: 100, height: 100, borderRadius: 24,
      background: 'linear-gradient(135deg, #957FE8, #ED7559)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
      boxShadow: '0 12px 32px -8px rgba(149,127,232,0.4)',
    }}>🎮</div>
    <div>
      <h3 style={{ fontFamily: 'Fredoka', fontSize: 22, fontWeight: 600, color: '#1a2942', marginBottom: 6 }}>Your game will appear here</h3>
      <p style={{ fontSize: 14, color: '#6c7f95', maxWidth: 400, lineHeight: 1.5 }}>
        Type an idea on the left, or pick a starter game below to get rolling.
      </p>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 440 }}>
      {SUGGESTIONS.slice(0, 4).map((s, i) => (
        <button key={i} onClick={() => onSuggest(s.prompt)} style={{
          padding: '10px 14px', borderRadius: 99,
          background: '#fff', border: '2px solid #957FE8',
          fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, color: '#957FE8',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>{s.emoji}</span>
          Build a {s.label.toLowerCase()}
        </button>
      ))}
    </div>
  </div>
);

Object.assign(window, { BuilderPage });
