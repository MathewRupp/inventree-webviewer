"""InvenTree Attachment Web Viewer plugin."""

import os

from django.http import FileResponse, Http404

from plugin import InvenTreePlugin
from plugin.mixins import SettingsMixin, UrlsMixin, UserInterfaceMixin

from . import PLUGIN_VERSION


class WebviewerPlugin(SettingsMixin, UrlsMixin, UserInterfaceMixin, InvenTreePlugin):
    """Plugin that allows viewing PDF, Markdown, and HTML attachments inline."""

    AUTHOR = "Mathew Rupp"
    DESCRIPTION = "View PDF, Markdown, and HTML attachments inline"
    VERSION = PLUGIN_VERSION
    MIN_VERSION = "0.12.0"
    NAME = "inventree-webviewer"
    SLUG = "webviewer"
    TITLE = "Attachment Web Viewer"

    SETTINGS = {
        "SUPPORTED_EXTENSIONS": {
            "name": "Supported Extensions",
            "description": "Comma-separated list of viewable file extensions (without dots)",
            "default": "pdf,md,markdown,html,htm",
        },
    }

    def _get_supported_extensions(self):
        """Return the set of supported file extensions."""
        raw = self.get_setting("SUPPORTED_EXTENSIONS")
        return {ext.strip().lower() for ext in raw.split(",") if ext.strip()}

    def _get_file_type(self, filename):
        """Determine the viewer type for a given filename."""
        ext = os.path.splitext(filename)[1].lstrip(".").lower()
        if ext == "pdf":
            return "pdf"
        if ext in ("md", "markdown"):
            return "markdown"
        if ext in ("html", "htm"):
            return "html"
        return None

    def _get_viewable_attachments(self, target_model, target_id):
        """Query attachments for a given model instance and filter to viewable ones."""
        from common.models import Attachment

        supported = self._get_supported_extensions()

        attachments = Attachment.objects.filter(
            model_type=target_model,
            model_id=target_id,
        )

        viewable = []
        for a in attachments:
            if not a.attachment:
                continue
            ext = os.path.splitext(a.attachment.name)[1].lstrip(".").lower()
            if ext in supported:
                file_type = self._get_file_type(a.attachment.name)
                if file_type:
                    viewable.append(
                        {
                            "id": a.pk,
                            "filename": os.path.basename(a.attachment.name),
                            "type": file_type,
                        }
                    )

        return viewable

    def get_ui_panels(self, request, context=None, **kwargs):
        """Return UI panels for attachment viewing."""
        panels = []

        if context is None:
            return panels

        target_model = context.get("target_model", None)
        target_id = context.get("target_id", None)

        if not target_model or not target_id:
            return panels

        viewable = self._get_viewable_attachments(target_model, target_id)

        if not viewable:
            return panels

        panels.append(
            {
                "key": "attachment-viewer",
                "title": "Attachment Viewer",
                "icon": "ti:file-text:outline",
                "source": self.plugin_static_file(
                    "WebviewerPanel.js:renderViewerPanel"
                ),
                "context": {
                    "attachments": viewable,
                },
            }
        )

        return panels

    def setup_urls(self):
        """Register URL endpoints for serving attachment content inline."""
        from django.urls import path

        return [
            path(
                "view/<int:attachment_id>/",
                self.view_attachment,
                name="webviewer-view",
            ),
        ]

    CONTENT_TYPES = {
        "pdf": "application/pdf",
        "markdown": "text/plain; charset=utf-8",
        "html": "text/html; charset=utf-8",
    }

    def view_attachment(self, request, attachment_id):
        """Serve attachment content with Content-Disposition: inline for in-browser viewing."""
        from common.models import Attachment

        try:
            attachment = Attachment.objects.get(pk=attachment_id)
        except Attachment.DoesNotExist:
            raise Http404("Attachment not found")

        if not attachment.attachment:
            raise Http404("No file associated with this attachment")

        file_type = self._get_file_type(attachment.attachment.name)
        if not file_type:
            raise Http404("Unsupported file type")

        content_type = self.CONTENT_TYPES.get(file_type, "application/octet-stream")
        filename = os.path.basename(attachment.attachment.name)

        response = FileResponse(
            attachment.attachment.open("rb"),
            content_type=content_type,
        )
        response["Content-Disposition"] = f'inline; filename="{filename}"'
        response["X-Frame-Options"] = "SAMEORIGIN"
        return response
