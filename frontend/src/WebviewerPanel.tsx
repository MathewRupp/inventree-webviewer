import React, { useMemo, useState } from 'react';
import { Group, NavLink, Stack, Text } from '@mantine/core';
import { IconFileTypePdf, IconMarkdown, IconHtml } from '@tabler/icons-react';
import { checkPluginVersion, type InvenTreePluginContext } from '@inventreedb/ui';
import { PdfViewer } from './viewers/PdfViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { HtmlViewer } from './viewers/HtmlViewer';

interface AttachmentInfo {
  id: number;
  filename: string;
  type: 'pdf' | 'markdown' | 'html';
}

function getIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <IconFileTypePdf size={18} />;
    case 'markdown':
      return <IconMarkdown size={18} />;
    case 'html':
      return <IconHtml size={18} />;
    default:
      return null;
  }
}

function WebviewerPanel({ context }: { context: InvenTreePluginContext }) {
  const attachments: AttachmentInfo[] = useMemo(
    () => (context?.context as { attachments?: AttachmentInfo[] })?.attachments ?? [],
    [context]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (attachments.length === 0) {
    return <Text>No viewable attachments found.</Text>;
  }

  const selected = attachments[selectedIndex];

  return (
    <Group align="flex-start" wrap="nowrap" style={{ height: '100%' }}>
      <Stack gap={0} style={{ minWidth: 200, maxWidth: 250, borderRight: '1px solid var(--mantine-color-default-border)' }}>
        {attachments.map((att, idx) => (
          <NavLink
            key={att.id}
            label={att.filename}
            leftSection={getIcon(att.type)}
            active={idx === selectedIndex}
            onClick={() => setSelectedIndex(idx)}
          />
        ))}
      </Stack>
      <div style={{ flex: 1, minHeight: '80vh', height: '100%' }}>
        {selected.type === 'pdf' && (
          <PdfViewer attachmentId={selected.id} filename={selected.filename} />
        )}
        {selected.type === 'markdown' && (
          <MarkdownViewer
            attachmentId={selected.id}
            filename={selected.filename}
            context={context}
          />
        )}
        {selected.type === 'html' && (
          <HtmlViewer attachmentId={selected.id} filename={selected.filename} />
        )}
      </div>
    </Group>
  );
}

export function renderViewerPanel(context: InvenTreePluginContext) {
  checkPluginVersion(context);
  return <WebviewerPanel context={context} />;
}
