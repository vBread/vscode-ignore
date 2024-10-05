import path from "node:path/posix";
import { type DocumentLink, type DocumentLinkProvider, Uri, workspace } from "vscode";
import { EntryType, parse } from "../language/parse";

export const provideDocumentLinks: DocumentLinkProvider["provideDocumentLinks"] = async (doc) => {
	const file = await parse(doc);
	const links: DocumentLink[] = [];

	const root = workspace.getWorkspaceFolder(doc.uri)?.uri.fsPath ?? "";

	for (const entry of file.entries) {
		if (entry.type === EntryType.Comment || entry.isDynamic) continue;

		const parent = entry.text ? root : path.dirname(doc.fileName);
		const target = Uri.file(path.join(parent, entry.text));

		try {
			await workspace.fs.readFile(target);

			links.push({ range: entry.range, target });
		} catch {
			continue;
		}
	}

	return links;
};
