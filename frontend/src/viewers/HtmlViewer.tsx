import React from 'react';

interface HtmlViewerProps {
  attachmentId: number;
  filename: string;
}

export function HtmlViewer({ attachmentId, filename }: HtmlViewerProps) {
  return (
    <iframe
      src={`/plugin/webviewer/view/${attachmentId}/`}
      title={filename}
      sandbox="allow-same-origin allow-scripts"
      style={{ width: '100%', height: '100%', border: 'none', minHeight: '80vh' }}
    />
  );
}
