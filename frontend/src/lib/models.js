// models.js — single source of truth for selectable models.
// Mirrors backend MODEL_REGISTRY (app/services/llm.py). Adding a model = one entry
// here + one there. `provider` drives the badge; the backend handles real vs mock.

export const MODELS = [
  { id: 'gemini-flash',  label: 'Gemini 3.5 Flash', provider: 'Gemini',    hint: 'fast' },
  { id: 'gemini-pro',    label: 'Gemini 1.5 Pro',   provider: 'Gemini',    hint: 'smart' },
  { id: 'claude-haiku',  label: 'Claude Haiku 4.5', provider: 'Anthropic', hint: 'fast' },
  { id: 'claude-sonnet', label: 'Claude Sonnet 4.6',provider: 'Anthropic', hint: 'balanced' },
  { id: 'claude-opus',   label: 'Claude Opus 4.8',  provider: 'Anthropic', hint: 'smart' },
  { id: 'gpt-4o-mini',   label: 'GPT-4o mini',      provider: 'OpenAI',    hint: 'fast' },
];

export const DEFAULT_MODEL = 'gemini-flash';

// For LabeledSelect: [{ label, value }]
export const MODEL_OPTIONS = MODELS.map((m) => ({
  label: `${m.label} · ${m.provider}`,
  value: m.id,
}));

export const modelLabel = (id) => MODELS.find((m) => m.id === id)?.label || id;
