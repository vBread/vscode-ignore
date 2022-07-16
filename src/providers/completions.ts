import fs from "fs";
import path from "path/posix";
import {
	CompletionItemKind as Kind,
	FileType,
	Position,
	Range,
	Uri,
	workspace,
	type CancellationToken,
	type CompletionContext,
	type CompletionItem,
	type TextDocument,
} from "vscode";

const triggerSuggest = {
	title: "Trigger Suggest",
	command: "editor.action.triggerSuggest",
};

export default async function (
	doc: TextDocument,
	pos: Position,
	token: CancellationToken,
	ctx: CompletionContext
): Promise<CompletionItem[]> {
	const completions: CompletionItem[] = [];

	const line = doc.getText(doc.lineAt(pos).range).trim();
	const prevChar = line[pos.character - 2];

	// TODO: Handle signature checking better
	if (ctx.triggerCharacter === "(" && prevChar === ":") {
		return ["top", "icase", "literal", "glob", "attr", "exclude"].map((signature) => ({
			label: signature,
			kind: Kind.Keyword,
		}));
	}

	if (line === "") {
		completions.push({
			label: "!",
			kind: Kind.Operator,
			command: triggerSuggest,
		});
	}

	const globStars = [
		{ label: "*", kind: Kind.Operator },
		{ label: "**", kind: Kind.Operator },
	];

	if (line.endsWith("/") || line === "") {
		completions.push(...globStars);
	} else if (line.endsWith(".")) {
		completions.push(...globStars.map((star) => ({ ...star, insertText: `/${star.label}` })));
	}

	const root = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath ?? "";

	const normalized = path.normalize(line.replace(/!/g, ""));
	const parent = path.isAbsolute(normalized) ? root : path.dirname(doc.fileName);

	let folder = path.join(parent, normalized);

	if (!ctx.triggerCharacter && !fs.existsSync(folder)) {
		folder = path.dirname(folder);
	}

	try {
		const files = await workspace.fs.readDirectory(Uri.file(folder));

		for (const [file, type] of files) {
			if (file === path.basename(doc.fileName)) continue;

			const isFile = type === FileType.File;

			completions.push({
				label: file,
				kind: isFile ? Kind.File : Kind.Folder,
				sortText: `${type & 1}_${file}`,
				insertText: file + (type === FileType.File ? "" : "/"),
				// FIXME: For some reason, adding a range causes '!' to not trigger completions
				range: new Range(new Position(pos.line, line.lastIndexOf("/") + 1), pos),
				command: isFile ? undefined : triggerSuggest,
			});
		}
	} catch {
		// TODO: Glob completions
		return [];
	}

	return completions;
}
