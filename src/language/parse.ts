import path from "node:path/posix";
import glob from "fast-glob";
import { Position, Range, type TextDocument, workspace } from "vscode";

export interface IgnoreFile {
	name: string;
	path: string;
	patterns: IgnorePattern[];
}

export enum PatternType {
	Comment,
	Pattern,
}

export interface IgnorePattern {
	type: PatternType;
	text: string;
	range: Range;
	isDynamic: boolean;
	isNegated: boolean;
	matches: string[];
}

export async function parse(document: TextDocument): Promise<IgnoreFile> {
	const root = workspace.getWorkspaceFolder(document.uri);
	if (!root) throw new ReferenceError("not in a workspace");

	const patterns: IgnorePattern[] = [];

	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i);
		const firstNwsIdx = line.firstNonWhitespaceCharacterIndex;

		if (line.isEmptyOrWhitespace) continue;

		const startPos = new Position(line.lineNumber, firstNwsIdx);

		const pattern = {
			text: line.text,
			isDynamic: false,
			isNegated: false,
			matches: [] as string[],
		};

		let type: PatternType;

		if (line.text[firstNwsIdx] === "#") {
			type = PatternType.Comment;
		} else {
			type = PatternType.Pattern;
			const trimmed = line.text.slice(firstNwsIdx);

			pattern.text = path.normalize(trimmed);
			pattern.isDynamic = glob.isDynamicPattern(trimmed, { dot: true });
			pattern.isNegated = line.text[firstNwsIdx] === "!";

			pattern.matches = await glob(pattern.text, {
				cwd: root.uri.fsPath,
				dot: true,
				onlyFiles: false,
				markDirectories: true,
			});
		}

		patterns.push({
			type,
			range: new Range(
				startPos,
				new Position(line.lineNumber, firstNwsIdx + pattern.text.length),
			),
			...pattern,
		});
	}

	return {
		name: document.fileName,
		path: document.uri.fsPath,
		patterns,
	};
}
