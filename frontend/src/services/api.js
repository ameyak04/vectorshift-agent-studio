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
};
