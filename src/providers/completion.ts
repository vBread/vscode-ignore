import { readdir, stat } from 'fs/promises';
import path from 'path';
import {
	CancellationToken,
	CompletionContext,
	CompletionItem,
	CompletionItemKind,
	Position,
	Range,
	TextDocument,
	workspace,
} from 'vscode';

const BUILT_IN_SIGNATURES = ['top', 'icase', 'literal', 'glob', 'attr', 'exclude'];

export async function completions(
	document: TextDocument,
	position: Position,
	_: any,
	context: CompletionContext
): Promise<CompletionItem[]> {
	const completionItems: CompletionItem[] = [];
	const line = document.getText(document.lineAt(position).range);

	if (!/^\.[\w-]+ignore$/.test(path.basename(document.fileName))) {
		return [];
	}

	if (context.triggerCharacter === '(' && line[position.character - 2] === ':') {
		return BUILT_IN_SIGNATURES.map((signature) => ({
			label: signature,
			kind: CompletionItemKind.Keyword,
		}));
	}

	const ws = workspace.getWorkspaceFolder(document.uri);
	if (!ws) return [];

	const normalized = path.normalize(line);
	const folder = path.join(
		normalized.startsWith(path.sep) ? ws.uri.fsPath : path.dirname(document.fileName),
		normalized
	);

	try {
		const contents = await readdir(folder);

		for (const item of contents) {
			const isFile = (await stat(path.join(folder, item))).isFile();

			completionItems.push({
				label: item,
				kind: isFile ? CompletionItemKind.File : CompletionItemKind.Folder,
				sortText: `${Number(isFile)}_${item}`,
				insertText: item,
				range: new Range(new Position(position.line, line.lastIndexOf('/') + 1), position),
			});
		}
	} catch {
		return [];
	}

	return completionItems;
}
