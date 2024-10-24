import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";
import {
	type CompletionItem,
	type CompletionItemProvider,
	FileType,
	CompletionItemKind as Kind,
	Position,
	Range,
	Uri,
	workspace,
} from "vscode";

const triggerSuggest = {
	title: "",
	command: "editor.action.triggerSuggest",
};

export const provideCompletionItems: CompletionItemProvider["provideCompletionItems"] = async (
	document,
	position,
	token,
	ctx,
) => {
	const completions: CompletionItem[] = [];

	const line = document.lineAt(position.line).text.trim();
	const prevChar = line[position.character - 2];

	if (line === "") {
		completions.push({
			label: "!",
			kind: Kind.Operator,
			command: triggerSuggest,
		});
	}

	const globStars = [
		{ label: "*", kind: Kind.Operator, command: triggerSuggest },
		{ label: "**", kind: Kind.Operator, command: triggerSuggest },
	];

	if (line.endsWith("/") || line === "") {
		completions.push(...globStars);
	} else if (line.endsWith(".")) {
		completions.push(...globStars.map((star) => ({ ...star, insertText: `/${star.label}` })));
	}

	if (line.endsWith("*") && prevChar !== "*") {
		const files = await workspace.findFiles(line, null, undefined, token);
		const extensions = new Set(files.map((file) => path.extname(file.fsPath)));

		for (const extension of extensions) {
			completions.push({
				label: extension,
				kind: Kind.Constant,
				range: new Range(new Position(position.line, line.lastIndexOf("*") + 1), position),
			});
		}

		return completions;
	}

	const root = workspace.getWorkspaceFolder(document.uri);
	if (!root) return [];

	const normalized = path.normalize(line.replace(/!/g, ""));
	const parent = normalized.startsWith("/") ? root.uri.fsPath : path.dirname(document.fileName);

	let folder = path.join(parent, normalized);

	if (!ctx.triggerCharacter && !fs.existsSync(folder)) {
		folder = path.dirname(folder);
	}

	try {
		const files = await workspace.fs.readDirectory(Uri.file(folder));

		for (const [file, type] of files) {
			if (file === path.basename(document.fileName)) continue;

			const isFile = type === FileType.File;
			const name = file + (isFile ? "" : "/");

			completions.push({
				label: name,
				kind: isFile ? Kind.File : Kind.Folder,
				sortText: `${type & 1}_${file}`,
				insertText: glob.escapePath(name),
				// FIXME: For some reason, adding a range causes '!' to not trigger completions
				range: new Range(new Position(position.line, line.lastIndexOf("/") + 1), position),
				command: isFile ? undefined : triggerSuggest,
			});
		}
	} catch {
		// TODO: Glob completions
		return [];
	}

	return completions;
};
