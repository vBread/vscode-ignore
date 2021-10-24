import { commands, ExtensionContext, languages } from 'vscode';
import * as cmds from './commands';
import * as pvds from './providers';

const TRIGGER_CHARS = ['/', '.', '('];

export function activate(context: ExtensionContext): void {
	const selector = { language: 'ignore', scheme: 'file' };

	const providers = [
		languages.registerCompletionItemProvider(
			selector,
			{ provideCompletionItems: pvds.completions },
			...TRIGGER_CHARS
		),
	];

	context.subscriptions.push(
		...providers,
		commands.registerCommand('ignore.newFile', cmds.newFile),
		commands.registerCommand('ignore.ignoreFile', cmds.ignoreFile)
	);
}
