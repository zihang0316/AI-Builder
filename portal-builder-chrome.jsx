/* AI Builder — chrome components (project bar, share, history, device, fullscreen, fix, attachments) */

/* ─────────────── Project Bar ─────────────── */

const ProjectBar = ({
  appName, setAppName,
  hasVersions, onViewChanges, onRestore,
  fixCount, onFix,
  access, setAccess, shareUrl,
}) => {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(appName);
  const [showShare, setShowShare] = useState(false);
  const inputRef = useRef(null);
  const shareWrapRef = useRef(null);

  useEffect(() => { setDraftName(appName); }, [appName]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // close share popover on outside click
  useEffect(() => {
    if (!showShare) return;
    const handler = (e) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target)) setShowShare(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShare]);

  const commitName = () => {
    const next = draftName.trim() || 'Untitled Game';
    setAppName(next);
    setEditing(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 16,
      background: '#fff', border: '1px solid #e3edf5',
      boxShadow: '0 1px 0 rgba(15,38,73,0.04), 0 6px 16px -8px rgba(15,38,73,0.08)',
      marginBottom: 18,
    }}>
      {/* Icon + Editable name */}
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'linear-gradient(135deg, #957FE8, #ED7559)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name="sparkles" size={17} stroke="#fff" strokeWidth={2.5} />
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          onBlur={commitName}
          onKeyDown={e => {
            if (e.key === 'Enter') commitName();
            if (e.key === 'Escape') { setDraftName(appName); setEditing(false); }
          }}
          maxLength={48}
          style={{
            fontFamily: 'Fredoka', fontSize: 17, fontWeight: 600, color: '#1a2942',
            border: '2px solid #957FE8', borderRadius: 8, padding: '4px 10px',
            outline: 'none', background: '#fff', minWidth: 200, maxWidth: 340,
          }}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          title="Click to rename"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            border: '2px solid transparent', borderRadius: 8, padding: '4px 10px',
            background: 'transparent', cursor: 'text',
            fontFamily: 'Fredoka', fontSize: 17, fontWeight: 600, color: '#1a2942',
            maxWidth: 340, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f8fb'; e.currentTarget.style.borderColor = '#e3edf5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          {appName}
          <Icon name="edit" size={13} stroke="#a3b5c8" />
        </button>
      )}

      {/* Saved indicator */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: '#3DB896', fontFamily: 'Fira Code', fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DB896' }} />
        Auto-saved
      </span>

      <div style={{ flex: 1 }} />

      {/* AI Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: 4, borderRadius: 12, background: '#f5f8fb', border: '1px solid #e3edf5',
      }}>
        <ToolbarBtn
          icon="diff"
          label="View Changes"
          onClick={onViewChanges}
          disabled={!hasVersions}
          tip="See what the AI changed in the latest version"
        />
        <ToolbarBtn
          icon="history"
          label="Restore"
          onClick={onRestore}
          disabled={!hasVersions}
          tip="Roll back to an earlier version"
        />
        <ToolbarBtn
          icon="wrench"
          label="Fix"
          onClick={onFix}
          badge={fixCount}
          color={fixCount ? '#ED7559' : undefined}
          tip={fixCount ? 'AI detected an issue. Click to review.' : 'No issues detected'}
        />
      </div>

      {/* Share */}
      <div ref={shareWrapRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowShare(s => !s)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 10,
            background: access === 'public' ? '#3DB896' : '#1a2942',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13,
            boxShadow: `0 3px 0 ${access === 'public' ? '#2a9e7e' : '#0e1a2e'}`,
          }}
        >
          <Icon name="share" size={14} stroke="#fff" strokeWidth={2.4} />
          Share
        </button>
        {showShare && (
          <ShareMenu
            access={access}
            setAccess={setAccess}
            shareUrl={shareUrl}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    </div>
  );
};

const ToolbarBtn = ({ icon, label, onClick, disabled, badge, color, tip }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tip}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 8,
      background: 'transparent', border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
      color: color || '#4a5e75', position: 'relative',
      transition: 'background .12s',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#fff'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    <Icon name={icon} size={14} stroke={color || '#4a5e75'} strokeWidth={2.2} />
    {label}
    {badge ? (
      <span style={{
        minWidth: 16, height: 16, padding: '0 4px', borderRadius: 99,
        background: '#ED7559', color: '#fff',
        fontSize: 10, fontFamily: 'Fredoka', fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginLeft: 2,
      }}>{badge}</span>
    ) : null}
  </button>
);

/* ─────────────── Share Menu ─────────────── */

const ShareMenu = ({ access, setAccess, shareUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try {
      navigator.clipboard?.writeText(shareUrl);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 360, background: '#fff', borderRadius: 16,
      border: '1px solid #e3edf5',
      boxShadow: '0 4px 0 rgba(15,38,73,0.04), 0 20px 50px -8px rgba(15,38,73,0.22)',
      padding: 18, zIndex: 50, animation: 'fadeIn .15s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'Fredoka', fontSize: 15, fontWeight: 600, color: '#1a2942' }}>Share your game</h3>
        <button onClick={onClose} style={{
          width: 26, height: 26, borderRadius: 6, border: 'none', background: '#f5f8fb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="x" size={14} stroke="#6c7f95" />
        </button>
      </div>

      {/* General Access */}
      <div style={{
        padding: 12, borderRadius: 12, background: '#f9fbfd', border: '1px solid #eef3f8',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, fontFamily: 'Fira Code', fontWeight: 700, color: '#a3b5c8', letterSpacing: 1, marginBottom: 10 }}>
          GENERAL ACCESS
        </div>
        <AccessRow
          icon="lock"
          color="#a3b5c8"
          title="Private"
          desc="Only you can see this"
          selected={access === 'private'}
          onClick={() => setAccess('private')}
        />
        <div style={{ height: 6 }} />
        <AccessRow
          icon="globe"
          color="#3DB896"
          title="Public"
          desc="Anyone with the link can play"
          selected={access === 'public'}
          onClick={() => setAccess('public')}
        />
      </div>

      {/* Link row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 12px',
        background: '#f5f8fb', borderRadius: 10, border: '1px solid #e3edf5',
        opacity: access === 'public' ? 1 : 0.5,
      }}>
        <Icon name="link" size={14} stroke="#6c7f95" />
        <span style={{
          flex: 1, fontFamily: 'Fira Code', fontSize: 11, color: '#4a5e75',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{shareUrl}</span>
        <button
          onClick={copy}
          disabled={access !== 'public'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 7,
            background: copied ? '#3DB896' : '#1a2942', color: '#fff',
            border: 'none', cursor: access === 'public' ? 'pointer' : 'not-allowed',
            fontFamily: 'Nunito', fontWeight: 700, fontSize: 11,
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={12} stroke="#fff" strokeWidth={2.4} />
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      {access === 'private' && (
        <p style={{ fontSize: 11, color: '#a3b5c8', marginTop: 10, lineHeight: 1.5 }}>
          Switch to <strong style={{ color: '#3DB896' }}>Public</strong> to share with friends.
        </p>
      )}
    </div>
  );
};

const AccessRow = ({ icon, color, title, desc, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: 10, borderRadius: 10,
      background: selected ? '#fff' : 'transparent',
      border: selected ? `2px solid ${color}` : '2px solid transparent',
      cursor: 'pointer', textAlign: 'left',
      boxShadow: selected ? '0 2px 6px rgba(15,38,73,0.05)' : 'none',
    }}
  >
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name={icon} size={16} stroke={color} strokeWidth={2.2} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#6c7f95' }}>{desc}</div>
    </div>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      border: `2px solid ${selected ? color : '#d6e6f0'}`,
      background: selected ? color : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {selected && <Icon name="check" size={10} stroke="#fff" strokeWidth={3} />}
    </div>
  </button>
);

/* ─────────────── Version Panel ─────────────── */

const VersionPanel = ({ versions, currentId, mode, onClose, onRestore, onSelect }) => {
  const [selectedId, setSelectedId] = useState(versions[0]?.id);
  const selected = versions.find(v => v.id === selectedId);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,38,73,0.32)', zIndex: 100,
        animation: 'fadeIn .18s ease-out',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(820px, 95vw)',
        background: '#fff', zIndex: 101,
        boxShadow: '-12px 0 40px -10px rgba(15,38,73,0.25)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .22s cubic-bezier(.22,.61,.36,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 22px', borderBottom: '1px solid #eef3f8',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: mode === 'restore' ? '#FDF7E3' : '#f0eeff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={mode === 'restore' ? 'history' : 'diff'} size={18}
              stroke={mode === 'restore' ? '#ED7559' : '#957FE8'} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Fredoka', fontSize: 17, fontWeight: 600, color: '#1a2942' }}>
              {mode === 'restore' ? 'Restore previous version' : 'View changes'}
            </h2>
            <p style={{ fontSize: 12, color: '#6c7f95' }}>
              {mode === 'restore'
                ? 'Roll back to any earlier version. Your current work will be saved.'
                : 'See what the AI changed across versions.'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #e3edf5',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={16} stroke="#6c7f95" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Version list */}
          <div style={{
            width: 280, borderRight: '1px solid #eef3f8', overflowY: 'auto',
            background: '#fafcfe', padding: '12px 10px',
          }}>
            {versions.map((v, i) => {
              const isCurrent = v.id === currentId;
              const isSelected = v.id === selectedId;
              return (
                <button key={v.id} onClick={() => setSelectedId(v.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  background: isSelected ? '#fff' : 'transparent',
                  border: isSelected ? '1px solid #d6e0ec' : '1px solid transparent',
                  boxShadow: isSelected ? '0 2px 6px rgba(15,38,73,0.06)' : 'none',
                  cursor: 'pointer', textAlign: 'left', marginBottom: 4,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: isCurrent ? '#3DB896' : '#f0eeff', color: isCurrent ? '#fff' : '#957FE8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fredoka', fontWeight: 600, fontSize: 11,
                  }}>v{versions.length - i}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942' }}>
                        Version {versions.length - i}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: 9, fontFamily: 'Fira Code', fontWeight: 700, color: '#3DB896', background: '#3DB89620', padding: '1px 5px', borderRadius: 3, letterSpacing: 0.5 }}>CURRENT</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6c7f95', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#a3b5c8', fontFamily: 'Fira Code', fontWeight: 600, marginTop: 3 }}>
                      {relativeTime(v.ts)}
                    </div>
                  </div>
                </button>
              );
            })}
            {versions.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#a3b5c8', fontSize: 12 }}>
                No versions yet. Generate a game to start building history.
              </div>
            )}
          </div>

          {/* Diff / detail */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {selected ? (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef3f8' }}>
                  <div style={{ fontSize: 11, fontFamily: 'Fira Code', fontWeight: 700, color: '#a3b5c8', letterSpacing: 1, marginBottom: 6 }}>
                    PROMPT
                  </div>
                  <p style={{ fontSize: 13, color: '#1a2942', lineHeight: 1.5 }}>{selected.label}</p>
                </div>

                <div style={{ padding: '16px 20px', borderBottom: '1px solid #eef3f8' }}>
                  <div style={{ fontSize: 11, fontFamily: 'Fira Code', fontWeight: 700, color: '#a3b5c8', letterSpacing: 1, marginBottom: 10 }}>
                    AI'S CHANGES
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.diffSummary.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '8px 12px', borderRadius: 8,
                        background: d.type === 'add' ? '#3DB89610' : d.type === 'remove' ? '#ED755910' : '#957FE810',
                      }}>
                        <span style={{
                          fontFamily: 'Fira Code', fontWeight: 700, fontSize: 11,
                          color: d.type === 'add' ? '#3DB896' : d.type === 'remove' ? '#ED7559' : '#957FE8',
                          flexShrink: 0, paddingTop: 1,
                        }}>{d.type === 'add' ? '+' : d.type === 'remove' ? '−' : '~'}</span>
                        <span style={{ fontSize: 13, color: '#1a2942', lineHeight: 1.5 }}>{d.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, padding: '16px 20px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 11, fontFamily: 'Fira Code', fontWeight: 700, color: '#a3b5c8', letterSpacing: 1, marginBottom: 10 }}>
                    CODE SNAPSHOT
                  </div>
                  <pre style={{
                    flex: 1, minHeight: 200, margin: 0, padding: 14, borderRadius: 10,
                    background: '#1a2942', color: '#a3d5f4',
                    fontFamily: 'Fira Code', fontSize: 11, lineHeight: 1.6,
                    overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>{selected.html.slice(0, 1400)}{selected.html.length > 1400 ? '\n…' : ''}</pre>
                </div>

                {/* Footer actions */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
                  padding: '14px 20px', borderTop: '1px solid #eef3f8', background: '#fafcfe',
                }}>
                  <Btn variant="outline" color="#6c7f95" onClick={onClose} size="sm">Close</Btn>
                  <Btn variant="outline" color="#957FE8" icon="eye" size="sm" onClick={() => onSelect(selected)}>Preview this</Btn>
                  <Btn color="#ED7559" icon="rotate" size="sm" onClick={() => onRestore(selected)} disabled={selected.id === currentId}>
                    {selected.id === currentId ? 'Already current' : 'Restore this version'}
                  </Btn>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3b5c8' }}>
                Select a version
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const relativeTime = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString();
};

/* ─────────────── Device Switcher ─────────────── */

const DeviceSwitcher = ({ device, setDevice }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 2, padding: 3,
    background: '#fff', border: '1px solid #e3edf5', borderRadius: 9,
  }}>
    {[
      { id: 'desktop', icon: 'desktop', label: 'Desktop' },
      { id: 'tablet', icon: 'tablet', label: 'Tablet' },
      { id: 'mobile', icon: 'mobile', label: 'Mobile' },
    ].map(d => (
      <button key={d.id} onClick={() => setDevice(d.id)} title={d.label} style={{
        width: 30, height: 26, borderRadius: 6, border: 'none',
        background: device === d.id ? '#1a2942' : 'transparent',
        color: device === d.id ? '#fff' : '#6c7f95',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .12s',
      }}>
        <Icon name={d.icon} size={14} stroke={device === d.id ? '#fff' : '#6c7f95'} strokeWidth={2.2} />
      </button>
    ))}
  </div>
);

/* ─────────────── Fix Banner ─────────────── */

const FixBanner = ({ issue, onApply, onDismiss }) => (
  <div style={{
    margin: '14px 18px 0', padding: 14, borderRadius: 12,
    background: '#FFF4EC', border: '1.5px solid #f9c9b3',
    display: 'flex', alignItems: 'flex-start', gap: 12,
    animation: 'fadeIn .2s ease-out',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: '#ED7559',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name="alert" size={16} stroke="#fff" strokeWidth={2.4} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <h4 style={{ fontFamily: 'Fredoka', fontSize: 13, fontWeight: 600, color: '#1a2942' }}>
          AI spotted an issue
        </h4>
        <span style={{ fontSize: 10, fontFamily: 'Fira Code', fontWeight: 700, color: '#ED7559', background: '#ED755920', padding: '1px 6px', borderRadius: 4, letterSpacing: 0.5 }}>
          PERMISSION NEEDED
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#6c7f95', lineHeight: 1.5, marginBottom: 4 }}>
        <strong style={{ color: '#1a2942' }}>{issue.title}</strong> — {issue.detail}
      </p>
      <p style={{ fontSize: 11, color: '#a07f4a', fontFamily: 'Fira Code', fontWeight: 600 }}>
        Suggested fix: {issue.fix}
      </p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
      <Btn color="#3DB896" size="sm" icon="check" onClick={onApply}>Apply fix</Btn>
      <Btn color="#6c7f95" variant="outline" size="sm" onClick={onDismiss}>Dismiss</Btn>
    </div>
  </div>
);

/* ─────────────── Attachment chips ─────────────── */

const AttachmentList = ({ items, onRemove }) => {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
      {items.map(a => (
        <div key={a.id} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 8px 6px 6px', borderRadius: 8,
          background: '#fff', border: '1.5px solid #e3edf5',
          maxWidth: 200,
        }}>
          {a.type?.startsWith('image/') && a.dataUrl ? (
            <img src={a.dataUrl} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: 5, background: '#f0eeff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="file" size={13} stroke="#957FE8" />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: 'Nunito', fontWeight: 700, color: '#1a2942', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
              {a.name}
            </div>
            <div style={{ fontSize: 9, color: '#a3b5c8', fontFamily: 'Fira Code', fontWeight: 600 }}>
              {formatBytes(a.size)}
            </div>
          </div>
          <button onClick={() => onRemove(a.id)} style={{
            width: 18, height: 18, borderRadius: 4, border: 'none', background: '#f5f8fb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            flexShrink: 0,
          }}>
            <Icon name="x" size={11} stroke="#6c7f95" />
          </button>
        </div>
      ))}
    </div>
  );
};

const formatBytes = (n) => {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
};

/* ─────────────── Fullscreen Overlay ─────────────── */

const FullscreenOverlay = ({ game, deviceWidth, onClose, onReload }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0e1a2e', zIndex: 200,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn .2s ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 18px', borderBottom: '1px solid #1a2942', background: '#0e1a2e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #957FE8, #ED7559)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sparkles" size={15} stroke="#fff" strokeWidth={2.4} />
          </div>
          <span style={{ color: '#fff', fontFamily: 'Fredoka', fontSize: 14, fontWeight: 600 }}>
            {game.title}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={onReload} title="Reload" style={{
          padding: '7px 12px', borderRadius: 8, border: '1px solid #2a3a55',
          background: 'transparent', color: '#a3d5f4', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
        }}>
          <Icon name="rotate" size={13} stroke="#a3d5f4" /> Reload
        </button>
        <button onClick={onClose} title="Exit fullscreen (Esc)" style={{
          padding: '7px 12px', borderRadius: 8, border: '1px solid #2a3a55',
          background: 'transparent', color: '#fff', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
        }}>
          <Icon name="minimize" size={13} stroke="#fff" /> Exit
        </button>
      </div>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'radial-gradient(circle at 50% 50%, #1a2942, #0e1a2e)',
      }}>
        <iframe
          srcDoc={game.html}
          title={game.title}
          style={{
            width: deviceWidth || '100%', maxWidth: '100%',
            height: '100%', border: 'none', borderRadius: 12, background: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};

Object.assign(window, {
  ProjectBar, ShareMenu, VersionPanel, DeviceSwitcher,
  FixBanner, AttachmentList, FullscreenOverlay, relativeTime,
});
