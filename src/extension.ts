import {
	commands,
	languages,
	window,
	workspace,
	type DocumentSelector,
	type ExtensionContext,
} from "vscode";
import * as cmds from "./commands";
import { provideCompletionItems } from "./providers";

const TRIGGER_CHARACTERS = ["/", "*", ".", "(", "~", "!", "#", "$", "@"];

export function activate(context: ExtensionContext): void {
	const selector: DocumentSelector = { language: "ignore", scheme: "file" };

	context.subscriptions.push(
		languages.registerCompletionItemProvider(
			selector,
			{ provideCompletionItems },
			...TRIGGER_CHARACTERS
		),
		commands.registerCommand("ignore.newFile", cmds.newFile),
		commands.registerCommand("ignore.ignorePath", cmds.ignorePath),
		commands.registerCommand("ignore.choose-template", cmds.template),
		window.onDidChangeActiveTextEditor((e) => {
			if (
				workspace.getConfiguration("ignore").get("promptChooseTemplateOnEmptyGitignore") &&
				e &&
				e.document.fileName.endsWith(".gitignore") &&
				/^\s*$/.test(e.document.getText())
			) {
				commands.executeCommand("ignore.choose-template");
			}
		})
	);
}
