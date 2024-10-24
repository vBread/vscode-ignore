import path from "node:path/posix";
import { type DocumentLink, type DocumentLinkProvider, Uri, workspace } from "vscode";
import { parse } from "../language/parse";

export const provideDocumentLinks: DocumentLinkProvider["provideDocumentLinks"] = async (doc) => {
	const file = await parse(doc);
	const links: DocumentLink[] = [];

	const cwd = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath ?? "";

	for (const pattern of file.patterns) {
		if (pattern.isDynamic) continue;

		const parent = pattern.text ? cwd : path.dirname(doc.fileName);
		const target = Uri.file(path.join(parent, pattern.text));

		try {
			await workspace.fs.readFile(target);

			links.push({ range: pattern.range, target });
		} catch {
			continue;
		}
	}

	return links;
};
