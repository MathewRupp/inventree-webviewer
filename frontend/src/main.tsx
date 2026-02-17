import React from 'react';
import ReactDOM from 'react-dom/client';
import { renderViewerPanel } from './WebviewerPanel';

// Dev entry point with mock context
const mockContext = {
  api: {
    get: (url: string) => {
      console.log('Mock API GET:', url);
      return Promise.resolve({ data: '# Hello World\n\nThis is a **mock** markdown file.' });
    },
  },
  context: {
    attachments: [
      { id: 1, filename: 'datasheet.pdf', url: '/mock/datasheet.pdf', type: 'pdf' as const },
      { id: 2, filename: 'notes.md', url: '/mock/notes.md', type: 'markdown' as const },
      { id: 3, filename: 'report.html', url: '/mock/report.html', type: 'html' as const },
    ],
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    {renderViewerPanel(mockContext as any)}
  </React.StrictMode>
);
