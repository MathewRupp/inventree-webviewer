import setuptools

setuptools.setup(
    name="inventree-webviewer-plugin",
    version="0.1.0",
    author="Mathew Rupp",
    description="View PDF, Markdown, and HTML attachments inline in InvenTree",
    packages=setuptools.find_packages(),
    include_package_data=True,
    install_requires=[],
    entry_points={
        "inventree_plugins": [
            "WebviewerPlugin = inventree_webviewer.webviewer:WebviewerPlugin"
        ]
    },
)
