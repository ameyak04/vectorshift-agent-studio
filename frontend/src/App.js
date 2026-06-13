import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineUI } from './ui';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-ink overflow-hidden text-paper">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="relative flex-1 min-w-0">
          <PipelineUI />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          unstyled: false,
          style: {
            background: 'rgba(12, 18, 28, 0.95)',
            border: '1px solid #1b2a3d',
            borderRadius: '4px',
            color: '#dbe7f2',
            fontFamily: '"IBM Plex Sans", sans-serif',
          },
        }}
      />
    </div>
  );
}

export default App;
