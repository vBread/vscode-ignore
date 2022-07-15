import { existsSync } from 'fs';
import { readdir, stat } from "fs/promises";
import { basename, extname, resolve } from "path";
import {
	CompletionItemKind as Kind,
	Position,
	Range, workspace, type CancellationToken,
	type CompletionContext,
	type CompletionItem, type TextDocument
} from "vscode";

const GIT_MAGIC_SIGNATURES = ["top", "icase", "literal", "glob", "attr", "exclude"];

export async function provideCompletionItems(
	doc: TextDocument,
	pos: Position,
	token: CancellationToken,
	ctx: CompletionContext
): Promise<CompletionItem[]> {
	const completions: CompletionItem[] = [];

	const line = doc.getText(doc.lineAt(pos).range).trim();
	const lineWithoutExclamationMark = line.replace(/!/g, '')

	const prevChar = line[pos.character - 2];

	if (ctx.triggerCharacter === "(" && prevChar === ":") {
		return GIT_MAGIC_SIGNATURES.map((signature) => ({
			label: signature,
			kind: Kind.Keyword,
		}));
	}

	if (line.endsWith("*") && prevChar !== "*") {

		const files = await workspace.findFiles(lineWithoutExclamationMark, undefined, undefined, token);
		const exts = new Set(files.map((file) => extname(file.fsPath)));

		for (const ext of exts) {
			completions.push({
				label: ext,
				kind: Kind.Constant,
				sortText: ext,
				insertText: ext,
				range: new Range(new Position(pos.line, line.lastIndexOf("*") + 1), pos),
			});
		}

		return completions;
	}

	const folder = resolve(doc.uri.fsPath, '../', /\/|\./.test(line) ? lineWithoutExclamationMark : '');

	if (!existsSync(folder)) return [];

	const files = await readdir(folder);

	if (line === '') {
		completions.push(
			{
				label: '!',
				kind: Kind.Value,
				command: {
					title: 'Trigger Completion',
					command: 'editor.action.triggerSuggest'
				}
			},
		)
	}

	if (line.endsWith('/') || line === '') {
		completions.push(
			{ label: '*', kind: Kind.Value },
			{ label: '**', kind: Kind.Value }
		)
	} else if (line.endsWith('.')) {
		completions.push(
			{ label: '*', insertText: '/*', kind: Kind.Value },
			{ label: '**', insertText: '/**', kind: Kind.Value }
		)
	}

	for (let i = 0; i < files.length; i++) {
		const fileName = files[i];
		if (fileName === basename(doc.fileName)) {
			continue;
		}
		try {
			const stats = await stat(resolve(folder, fileName));
			const isDir = stats.isDirectory();

			const insertText = (isDir ? `${fileName}/` : fileName)

			completions.push({
				label: fileName,
				kind: isDir ? Kind.Folder : Kind.File,
				insertText: line.endsWith('.') ? `/${insertText}` : insertText,
				command: isDir
					? {
						title: 'Trigger Completion',
						command: 'editor.action.triggerSuggest'
					}
					: undefined
			});
		} catch { }
	}
	return completions;
}
