import path from "node:path";
import { type ExtensionContext, commands as vscCommands, window, workspace } from "vscode";
import { commands } from "./commands";
import { diagnostics, providers } from "./features";
import { getConfig } from "./util";

export async function activate(context: ExtensionContext): Promise<void> {
	if (window.activeTextEditor) {
		await diagnostics.update(window.activeTextEditor.document);
	}

	const textEditorChange = window.onDidChangeActiveTextEditor(async (editor) => {
		if (!editor) return;

		const config = getConfig();
		const isIgnoreFile = /^\..+ignore$/.test(path.basename(editor.document.fileName));
		const isEmpty = !editor.document.getText().trim().length;

		if (config.promptOnEmptyFile && isIgnoreFile && isEmpty) {
			const response = await window.showInformationMessage(
				"Empty ignore file detected, would you like to use a template?",
				"Yes",
				"No",
				"Disable this message",
			);

			if (!response || response === "No") return;

			if (response === "Disable this message") {
				return config.update("ignore.promptOnEmptyFile", false);
			}

			await vscCommands.executeCommand("ignore.chooseTemplate");
		}

		await diagnostics.update(editor.document);
	});

	const textDocChange = workspace.onDidChangeTextDocument(async (event) => {
		await diagnostics.update(event.document);
	});

	context.subscriptions.push(
		...providers,
		...commands,
		diagnostics.collection,
		textEditorChange,
		textDocChange,
	);
}
