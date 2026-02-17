import React from 'react';

interface PdfViewerProps {
  attachmentId: number;
  filename: string;
}

export function PdfViewer({ attachmentId, filename }: PdfViewerProps) {
  return (
    <iframe
      src={`/plugin/webviewer/view/${attachmentId}/`}
      title={filename}
      style={{ width: '100%', height: '100%', border: 'none', minHeight: '80vh' }}
    />
  );
}
