import path from "node:path/posix";
import glob from "fast-glob";
import { Position, Range, type TextDocument, Uri, workspace } from "vscode";

export interface IgnoreFile {
	name: string;
	path: string;
	patterns: IgnorePattern[];
}

export interface IgnorePattern {
	text: string;
	range: Range;
	isDynamic: boolean;
	isNegated: boolean;
	matches: IgnorePatternMatch[];
}

export interface IgnorePatternMatch {
	text: string;
	uri: Uri;
}

export async function parse(document: TextDocument): Promise<IgnoreFile> {
	const cwd = workspace.getWorkspaceFolder(document.uri);
	if (!cwd) throw new ReferenceError("not in a workspace");

	const patterns: IgnorePattern[] = [];

	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i);
		const firstNwsIdx = line.firstNonWhitespaceCharacterIndex;

		if (line.isEmptyOrWhitespace || line.text[firstNwsIdx] === "#") {
			continue;
		}

		const startPos = new Position(line.lineNumber, firstNwsIdx);

		const trimmed = line.text.slice(firstNwsIdx);
		const text = path.normalize(trimmed);

		const matches = await glob(text, {
			cwd: cwd.uri.fsPath,
			dot: true,
			onlyFiles: false,
			markDirectories: true,
		});

		patterns.push({
			text: path.normalize(trimmed),
			range: new Range(startPos, new Position(line.lineNumber, firstNwsIdx + text.length)),
			isDynamic: glob.isDynamicPattern(trimmed),
			isNegated: line.text[firstNwsIdx] === "!",
			matches: matches.map((match) => ({
				text: match,
				uri: Uri.file(path.join(cwd.uri.fsPath, match)),
			})),
		});
	}

	return {
		name: document.fileName,
		path: document.uri.fsPath,
		patterns,
	};
}
