import path from "node:path/posix";
import glob from "fast-glob";
import { Position, Range, type TextDocument, workspace } from "vscode";

export interface IgnoreFile {
	name: string;
	path: string;
	entries: IgnoreEntry[];
}

export enum EntryType {
	Comment,
	Pattern,
}

export interface IgnoreEntry {
	type: EntryType;
	text: string;
	range: Range;
	isDynamic: boolean;
	isNegated: boolean;
}

export async function parse(document: TextDocument): Promise<IgnoreFile> {
	const root = workspace.getWorkspaceFolder(document.uri) ?? "";
	if (!root) throw new ReferenceError("not in a workspace");

	const entries: IgnoreEntry[] = [];

	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i);
		const firstNwsIdx = line.firstNonWhitespaceCharacterIndex;

		if (line.isEmptyOrWhitespace) continue;

		const startPos = new Position(line.lineNumber, firstNwsIdx);

		const entry = {
			text: line.text,
			isDynamic: false,
			isNegated: false,
		};

		let type: EntryType;

		if (line.text[firstNwsIdx] === "#") {
			type = EntryType.Comment;
		} else {
			type = EntryType.Pattern;
			const trimmed = line.text.slice(firstNwsIdx);

			entry.text = path.normalize(trimmed);
			entry.isDynamic = glob.isDynamicPattern(trimmed, { dot: true });
			entry.isNegated = line.text[firstNwsIdx] === "!";
		}

		entries.push({
			type,
			range: new Range(
				startPos,
				new Position(line.lineNumber, firstNwsIdx + entry.text.length),
			),
			...entry,
		});
	}

	return {
		name: document.fileName,
		path: document.uri.fsPath,
		entries,
	};
}
