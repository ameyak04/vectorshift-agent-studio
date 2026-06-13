// submit.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const BACKEND_URL = 'http://localhost:8000/pipelines/parse';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const { num_nodes, num_edges, is_dag } = await response.json();

            alert(
                `Pipeline submitted successfully! ✅\n\n` +
                `• Nodes: ${num_nodes}\n` +
                `• Edges: ${num_edges}\n` +
                `• Valid DAG: ${is_dag ? 'Yes ✅' : 'No ⚠️ (contains a cycle)'}`
            );
        } catch (err) {
            alert(
                `Could not reach the backend. ❌\n\n` +
                `${err.message}\n\n` +
                `Make sure it is running:\n  cd backend && uvicorn main:app --reload`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center gap-3 px-5 py-3 bg-surface border-t border-border">
            <span className="text-xs text-muted">
                {nodes.length} node{nodes.length === 1 ? '' : 's'} · {edges.length} edge{edges.length === 1 ? '' : 's'}
            </span>
            <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold
                           shadow-lg shadow-accent/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Submitting…' : 'Submit Pipeline'}
            </button>
        </div>
    );
}
