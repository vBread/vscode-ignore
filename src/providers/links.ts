import path from "path/posix";
import { Position, Range, Uri, workspace, type DocumentLink, type TextDocument } from "vscode";

export default async function (doc: TextDocument): Promise<DocumentLink[]> {
	const links: DocumentLink[] = [];

	const lines = doc
		.getText()
		.split("\n")
		.map((line) => line.trim());

	const root = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath ?? "";

	let lineNum = -1;

	for (const line of lines) {
		lineNum++;
		if (line === "" || line.startsWith("#")) continue;

		const normalized = path.normalize(line);
		const parent = path.isAbsolute(normalized) ? root : path.dirname(doc.fileName);

		const target = Uri.file(path.join(parent, normalized));

		try {
			await workspace.fs.readFile(target);

			const nwsChar = doc.lineAt(lineNum).firstNonWhitespaceCharacterIndex;

			const start = new Position(lineNum, nwsChar);
			const end = new Position(lineNum, nwsChar + normalized.length);

			links.push({
				range: new Range(start, end),
				target,
			});
		} catch {
			continue;
		}
	}

	return links;
}
