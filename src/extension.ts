import path from "node:path";
import { commands, type ExtensionContext, window } from "vscode";
import registeredCommands from "./commands";
import registeredProviders from "./providers";
import { getConfig } from "./util";

export async function activate(context: ExtensionContext): Promise<void> {
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

			await commands.executeCommand("ignore.chooseTemplate");
		}
	});

	context.subscriptions.push(...registeredProviders, ...registeredCommands, textEditorChange);
}
