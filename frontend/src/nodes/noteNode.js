// noteNode.js — demo node: a free-floating sticky note with no handles,
// proving the abstraction supports nodes with zero connections.

import { StickyNote } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledTextarea } from './fields';
import { useNodeField } from './fields/useNodeField';

export const NoteNode = ({ id }) => {
  const [note, setNote] = useNodeField(id, 'note', 'Add a comment…');

  return (
    <BaseNode id={id} title="Note" subtitle={id} icon={StickyNote} category="note" handles={[]}>
      <LabeledTextarea value={note} onChange={setNote} rows={3} placeholder="Write a note…" />
    </BaseNode>
  );
};
