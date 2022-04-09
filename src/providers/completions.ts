import glob from "fast-glob";
import { readdir, stat } from "fs/promises";
import path from "path";
import {
	type CancellationToken,
	type CompletionContext,
	type CompletionItem,
	CompletionItemKind as Kind,
	Position,
	Range,
	type TextDocument,
	workspace,
} from "vscode";

const GIT_MAGIC_SIGNATURES = ["top", "icase", "literal", "glob", "attr", "exclude"];

export async function provideCompletionItems(
	doc: TextDocument,
	pos: Position,
	token: CancellationToken,
	ctx: CompletionContext
): Promise<CompletionItem[]> {
	const completions: CompletionItem[] = [];

	const line = doc.getText(doc.lineAt(pos).range);
	const prevChar = line[pos.character - 2];

	let start = new Position(pos.line, line.lastIndexOf("/") + 1);

	if (ctx.triggerCharacter === "(" && prevChar === ":") {
		return GIT_MAGIC_SIGNATURES.map((signature) => ({
			label: signature,
			kind: Kind.Keyword,
		}));
	}

	if (ctx.triggerCharacter === "*" && prevChar !== "*") {
		const files = await workspace.findFiles(line, undefined, undefined, token);
		const exts = new Set(files.map((file) => path.extname(file.fsPath)));

		start = new Position(pos.line, line.lastIndexOf("*") + 1);

		for (const ext of exts) {
			completions.push({
				label: ext,
				kind: Kind.Constant,
				sortText: ext,
				insertText: ext,
				range: new Range(start, pos),
			});
		}

		return completions;
	}

	const ws = workspace.getWorkspaceFolder(doc.uri);
	if (!ws) return [];

	const normalized = path.normalize(line);
	const parent = normalized.startsWith(path.sep) ? ws.uri.fsPath : path.dirname(doc.fileName);

	const folder = path.join(parent, normalized);

	try {
		const entries = await readdir(folder);

		for (const entry of entries) {
			const isFile = (await stat(path.join(folder, entry))).isFile();

			completions.push({
				label: entry,
				kind: isFile ? Kind.File : Kind.Folder,
				sortText: `${Number(isFile)}_${entry}`,
				insertText: entry,
				range: new Range(start, pos),
			});
		}
	} catch {
		if (!line.includes("*") && !line.endsWith("/")) {
			return [];
		}

		const entries = await glob(`${line}*`, {
			cwd: parent,
			objectMode: true,
			onlyFiles: false,
		});

		for (const entry of entries) {
			// TODO: Find a better way to filter immediate children
			if (entry.path.match(/\//g)!.length !== line.match(/\*\*/g)!.length + 1) {
				continue;
			}

			const isFile = entry.dirent.isFile();

			completions.push({
				label: entry.name,
				kind: isFile ? Kind.File : Kind.Folder,
				sortText: `${Number(isFile)}_${entry.name}`,
				insertText: entry.name,
				range: new Range(start, pos),
			});
		}

		return completions;
	}

	return completions;
}
