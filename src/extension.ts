import { basename } from "path";
import { commands, window, type ExtensionContext } from "vscode";
import registeredCommands from "./commands";
import registeredProviders from "./providers";
import { getConfig } from "./util";

export function activate(context: ExtensionContext): void {
	const textEditorChange = window.onDidChangeActiveTextEditor(async (editor) => {
		if (!editor) return;

		const config = getConfig();
		const isIgnoreFile = /^\..+ignore$/.test(basename(editor.document.fileName));
		const isEmpty = !editor.document.getText().trim();

		if (config.promptOnEmptyFile && isIgnoreFile && isEmpty) {
			const response = await window.showInformationMessage(
				"Empty ignore file detected, would you like to use a template?",
				"Yes",
				"No",
				"Disable this message"
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
