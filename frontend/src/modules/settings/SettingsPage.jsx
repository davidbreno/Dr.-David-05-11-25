import { useMemo } from 'react';
import { useSettings } from './SettingsProvider.jsx';

const textPrimaryStyle = { color: 'var(--text-color)' };
const textMutedStyle = { color: 'var(--text-muted)' };

const ToggleControl = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-all duration-200"
    style={{
      borderColor: checked ? 'var(--card-border-strong)' : 'var(--card-border)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.06) 100%)',
      color: 'var(--text-color)',
    }}
  >
    <span className="text-left">
      <span className="block text-base font-semibold" style={textPrimaryStyle}>
        {label}
      </span>
      {description ? (
        <span className="mt-1 block text-sm" style={textMutedStyle}>
          {description}
        </span>
      ) : null}
    </span>
    <span
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-gray-500/60'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}
      />
    </span>
  </button>
);

const ThemePreview = ({ theme, active }) => {
  const accentColor = theme.cssVars['--accent'] ?? 'rgba(125, 237, 222, 0.8)';
  const sidebar = theme.cssVars['--sidebar-active-bg'] ?? accentColor;
  const card = theme.cssVars['--card-bg'] ?? 'rgba(33, 34, 45, 0.85)';
  const border = theme.cssVars['--card-border'] ?? 'rgba(255, 255, 255, 0.14)';

  return (
    <div className="space-y-3">
      <div
        className="h-20 w-full rounded-xl border"
        style={{
          background: theme.cssVars['--app-bg'],
          borderColor: active ? theme.cssVars['--card-border-strong'] ?? accentColor : 'rgba(255, 255, 255, 0.12)',
          boxShadow: active ? '0 20px 45px rgba(0,0,0,0.32)' : '0 18px 40px rgba(0,0,0,0.2)',
        }}
      />
      <div className="flex items-center gap-2">
        <span
          className="h-10 w-10 rounded-xl"
          style={{
            background: sidebar,
            border: `1px solid ${theme.cssVars['--sidebar-border'] ?? accentColor}`,
          }}
        />
        <span
          className="h-10 flex-1 rounded-xl border"
          style={{
            background: card,
            borderColor: border,
          }}
        />
      </div>
    </div>
  );
};

const FontPreview = ({ font }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium" style={textMutedStyle}>
      {font.preview}
    </p>
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        borderColor: 'var(--card-border)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.08) 100%)',
        fontFamily: font.stack,
        color: 'var(--text-color)',
      }}
    >
      <div className="text-lg font-semibold">Aa Bb Cc</div>
      <div className="text-sm opacity-80">DentCare Experience</div>
    </div>
  </div>
);

export default function SettingsPage() {
  const {
    preferences,
    themeOptions,
    fontOptions,
    setTheme,
    setFont,
    setShowTexture,
    setAnimations,
    setCompactSpacing,
    resetPreferences,
  } = useSettings();

  const activeTheme = useMemo(
    () => themeOptions.find((theme) => theme.id === preferences.theme) ?? themeOptions[0],
    [preferences.theme, themeOptions],
  );

  const activeFont = useMemo(
    () => fontOptions.find((font) => font.id === preferences.font) ?? fontOptions[0],
    [preferences.font, fontOptions],
  );

  return (
    <div className="space-y-8 pb-14">
      <header className="space-y-2">
        <h1 className="page-title">Configurações</h1>
        <p className="max-w-2xl text-sm" style={textMutedStyle}>
          Personalize o visual do sistema, escolha seu tema favorito e ajuste detalhes como textura, animações e fonte
          preferida. As alterações são salvas automaticamente para a próxima sessão.
        </p>
      </header>

      <section className="card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold" style={textPrimaryStyle}>
              Tema visual
            </h2>
            <p className="text-sm" style={textMutedStyle}>
              Alterna entre os estilos sugeridos (nude, preto com dourado, branco com verde) ou mantenha o modo escuro
              original.
            </p>
          </div>
          <button type="button" className="btn-secondary text-sm" onClick={resetPreferences}>
            Restaurar padrão
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {themeOptions.map((theme) => {
            const isActive = theme.id === preferences.theme;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setTheme(theme.id)}
                className="group flex h-full flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{
                  borderColor: isActive ? theme.cssVars['--card-border-strong'] ?? 'var(--accent)' : 'var(--card-border)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.08) 100%)',
                  boxShadow: isActive ? '0 18px 45px rgba(0,0,0,0.3)' : '0 10px 32px rgba(0,0,0,0.15)',
                  color: 'var(--text-color)',
                  transform: isActive ? 'translateY(-4px)' : 'none',
                }}
              >
                <ThemePreview theme={theme} active={isActive} />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold" style={textPrimaryStyle}>
                      {theme.name}
                    </span>
                    {isActive ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--accent)', color: '#081019' }}>
                        Ativo
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-relaxed" style={textMutedStyle}>
                    {theme.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={textPrimaryStyle}>
              Tipografia
            </h2>
            <p className="text-sm" style={textMutedStyle}>
              Escolha uma das fontes sugeridas para combinar com a identidade visual do consultório.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fontOptions.map((font) => {
              const isActive = font.id === preferences.font;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setFont(font.id)}
                  className="flex h-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{
                    borderColor: isActive ? 'var(--card-border-strong)' : 'var(--card-border)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.08) 100%)',
                    color: 'var(--text-color)',
                    transform: isActive ? 'translateY(-4px)' : 'none',
                    boxShadow: isActive ? '0 16px 35px rgba(0,0,0,0.24)' : '0 12px 30px rgba(0,0,0,0.16)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold" style={textPrimaryStyle}>
                      {font.name}
                    </span>
                    {isActive ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--accent)', color: '#081019' }}>
                        Ativa
                      </span>
                    ) : null}
                  </div>
                  <FontPreview font={font} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="card space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={textPrimaryStyle}>
              Preferências adicionais
            </h2>
            <p className="text-sm" style={textMutedStyle}>
              Ajustes rápidos para deixar a interface com a sua cara.
            </p>
          </div>
          <div className="space-y-3">
            <ToggleControl
              label="Textura de grade no fundo"
              description="Adiciona a malha suave sobre o gradiente principal."
              checked={preferences.showTexture}
              onChange={setShowTexture}
            />
            <ToggleControl
              label="Animações suaves"
              description="Habilita transições e efeitos nos componentes."
              checked={preferences.animations}
              onChange={setAnimations}
            />
            <ToggleControl
              label="Modo compacto"
              description="Reduz espaçamentos e deixa a interface mais enxuta."
              checked={preferences.compactSpacing}
              onChange={setCompactSpacing}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-5">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold" style={textPrimaryStyle}>
            Pré-visualização rápida
          </h2>
          <p className="text-sm" style={textMutedStyle}>
            Veja como o tema "{activeTheme.name}" e a fonte "{activeFont.name}" se combinam nos principais elementos.
          </p>
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{
            borderColor: 'var(--card-border)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.06) 100%)',
            fontFamily: activeFont.stack,
            color: 'var(--text-color)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold" style={{ fontFamily: 'var(--heading-font)' }}>
                Agenda do dia
              </h3>
              <p className="text-sm" style={textMutedStyle}>
                3 pacientes aguardando confirmação e 5 procedimentos em andamento.
              </p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--accent)', color: '#081019' }}>
              Destaque
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--card-border)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.12) 100%)',
                }}
              >
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Procedimento #{item}
                </p>
                <p className="mt-1 text-base font-semibold">Limpeza + avaliação</p>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  09:3{item} - Dr. Henrique Lima
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
