const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  async parsePipeline(nodes, edges) {
    const response = await fetch(`${BASE_URL}/pipelines/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async streamPipeline(nodes, edges, onEvent) {
    const response = await fetch(`${BASE_URL}/pipelines/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop(); // keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              onEvent(data);
            } catch (err) {
              console.error("Error parsing SSE JSON:", err);
            }
          }
        }
      }
    }
  },

  // ---- Saved agents (best-effort backend mirror) ----
  async listAgents() {
    const res = await fetch(`${BASE_URL}/agents`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.agents || [];
  },

  async saveAgent(record) {
    const res = await fetch(`${BASE_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteAgent(id) {
    const res = await fetch(`${BASE_URL}/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async extractFileText(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/files/extract-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  async evaluatePipeline(nodes, edges, cases) {
    const response = await fetch(`${BASE_URL}/pipelines/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges, cases }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Evaluation failed: ${response.statusText}`);
    }

    return response.json();
  }
};
