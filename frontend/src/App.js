import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-canvas overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 bg-surface border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white font-bold">
          VS
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100 leading-tight">VectorShift</h1>
          <p className="text-xs text-muted leading-tight">Pipeline Builder</p>
        </div>
      </header>

      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
