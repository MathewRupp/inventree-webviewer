import React, { useEffect, useState } from 'react';
import { Paper, Loader, Text, TypographyStylesProvider } from '@mantine/core';
import type { InvenTreePluginContext } from '@inventreedb/ui';

interface MarkdownViewerProps {
  attachmentId: number;
  filename: string;
  context: InvenTreePluginContext;
}

export function MarkdownViewer({ attachmentId, filename, context }: MarkdownViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    context.api
      .get(`/plugin/webviewer/view/${attachmentId}/`)
      .then((response: { data: string }) => {
        if (!cancelled) {
          setContent(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(`Failed to load ${filename}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attachmentId, filename, context.api]);

  if (error) {
    return <Text c="red">{error}</Text>;
  }

  if (content === null) {
    return <Loader />;
  }

  return (
    <Paper p="md" style={{ overflow: 'auto', maxHeight: '80vh' }}>
      <TypographyStylesProvider>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
          {content}
        </pre>
      </TypographyStylesProvider>
    </Paper>
  );
}
