import { Position, type Uri, window, workspace, WorkspaceEdit } from "vscode";
import { promptTemplate } from "../util";

export default async function (uri?: Uri): Promise<void> {
	const document = window.activeTextEditor?.document;

	if (!document) {
		await window.showErrorMessage("Could not apply template, no active text editor");
		return;
	}

	const template = await promptTemplate();
	if (!template) return;

	const edit = new WorkspaceEdit();
	edit.insert(uri ?? document.uri, new Position(0, 0), template);

	await workspace.applyEdit(edit);
	await document?.save();
}
