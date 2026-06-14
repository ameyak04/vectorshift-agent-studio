"""
Provider-agnostic LLM layer.

A single MODEL_REGISTRY maps a stable model id (what the frontend sends in
node.data.model) to a provider + the provider's concrete model name. `call_llm`
dispatches to the right provider for plain LLM nodes. Adding a model/provider is
a single registry entry. Every path degrades to a labeled mock when the relevant
API key is missing or the provider is rate-limited, so the app always responds.
"""

import os
from typing import Tuple

# id -> (provider, concrete model name, human label)
MODEL_REGISTRY = {
    "gemini-flash":  ("gemini",    "gemini-3.5-flash",            "Gemini 3.5 Flash"),
    "gemini-pro":    ("gemini",    "gemini-1.5-pro",              "Gemini 1.5 Pro"),
    "claude-haiku":  ("anthropic", "claude-haiku-4-5-20251001",  "Claude Haiku 4.5"),
    "claude-sonnet": ("anthropic", "claude-sonnet-4-6",          "Claude Sonnet 4.6"),
    "claude-opus":   ("anthropic", "claude-opus-4-8",            "Claude Opus 4.8"),
    "gpt-4o-mini":   ("openai",    "gpt-4o-mini",                "GPT-4o mini"),
}

DEFAULT_MODEL = "gemini-flash"


def resolve(model_id: str) -> Tuple[str, str, str]:
    """Return (provider, model_name, label) for a model id, falling back to default."""
    return MODEL_REGISTRY.get(model_id, MODEL_REGISTRY[DEFAULT_MODEL])


def gemini_key() -> str:
    return os.getenv("GEMINI_API_KEY", "")


def anthropic_key() -> str:
    return os.getenv("ANTHROPIC_API_KEY", "")


def openai_key() -> str:
    return os.getenv("OPENAI_API_KEY", "")


def provider_key(provider: str) -> str:
    return {"gemini": gemini_key(), "anthropic": anthropic_key(), "openai": openai_key()}.get(provider, "")


def _mock(label: str, prompt: str) -> str:
    snippet = (prompt or "").strip().replace("\n", " ")[:160]
    return f"[Mock · {label}] No API key configured for this provider. Simulated response to: {snippet}"


async def call_llm(model_id: str, system: str, prompt: str, temperature: float = 0.7) -> Tuple[str, int]:
    """Run a single (non-tool) completion. Returns (text, approx_tokens)."""
    provider, model_name, label = resolve(model_id)
    key = provider_key(provider)

    if not key:
        text = _mock(label, prompt)
        return text, len(text) // 4

    try:
        if provider == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=key)
            model = genai.GenerativeModel(model_name, system_instruction=system or None)
            resp = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=temperature),
            )
            text = resp.text

        elif provider == "anthropic":
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=key)
            resp = await client.messages.create(
                model=model_name,
                max_tokens=1024,
                temperature=temperature,
                system=system or "You are a helpful assistant.",
                messages=[{"role": "user", "content": prompt}],
            )
            text = "".join(b.text for b in resp.content if getattr(b, "type", None) == "text")

        elif provider == "openai":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=key)
            resp = await client.chat.completions.create(
                model=model_name,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system or "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
            )
            text = resp.choices[0].message.content

        else:
            text = _mock(label, prompt)

    except Exception as e:
        msg = str(e)
        if "429" in msg or "quota" in msg.lower() or "rate" in msg.lower():
            text = f"[Rate Limited · {label}] Provider quota exceeded. Simulated response to: {(prompt or '')[:120]}"
        else:
            text = f"[Error · {label}] {msg}"

    return text, len(text) // 4
