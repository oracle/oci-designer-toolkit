/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
	  vscode.commands.registerCommand('okitOcd.start', () => {
		// Create and show panel
		const panel = vscode.window.createWebviewPanel(
		  'okitOcd',
		  'Okit Ocd',
		  vscode.ViewColumn.One,
		  {}
		);
  
		// And set its HTML content
		panel.webview.html = getWebviewContent();
	  })
	);
  }
  
  function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Okit Ocd</title>
  </head>
  <body>
	  <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  </body>
  </html>`;
  }
