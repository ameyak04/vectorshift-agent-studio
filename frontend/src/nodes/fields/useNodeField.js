// useNodeField.js
// ------------------------------------------------------------------
// A small hook that binds a single node field to the Zustand store.
// This fixes the original bug where node inputs only lived in local
// component state (via useState) and never reached the store — meaning
// the submitted pipeline would have been missing the user's data.
//
// Usage:
//   const [name, setName] = useNodeField(id, 'inputName', defaultValue);
// ------------------------------------------------------------------

import { useStore } from '../../store';

export const useNodeField = (nodeId, fieldName, defaultValue = '') => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const value = useStore((s) => {
    const node = s.nodes.find((n) => n.id === nodeId);
    const current = node?.data?.[fieldName];
    return current === undefined ? defaultValue : current;
  });

  const setValue = (next) => updateNodeField(nodeId, fieldName, next);

  return [value, setValue];
};
