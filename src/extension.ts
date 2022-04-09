import { commands, type DocumentSelector, type ExtensionContext, languages } from "vscode";
import * as cmds from "./commands";
import { provideCompletionItems } from "./providers";

export function activate(context: ExtensionContext): void {
	const selector: DocumentSelector = { language: "ignore", scheme: "file" };

	context.subscriptions.push(
		languages.registerCompletionItemProvider(selector, { provideCompletionItems }, ..."/.(*"),
		commands.registerCommand("ignore.newFile", cmds.newFile),
		commands.registerCommand("ignore.ignoreFile", cmds.ignoreFile)
	);
}
