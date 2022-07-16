import { Position, window, workspace, WorkspaceEdit, type Uri } from "vscode";
import { promptTemplate } from "../util";

export default async function (uri?: Uri): Promise<void> {
	const document = window.activeTextEditor?.document;

	if (!document) {
		return void window.showErrorMessage("Could not apply template, no active text editor");
	}

	const template = await promptTemplate();
	if (!template) return;

	const edit = new WorkspaceEdit();
	edit.insert(uri ?? document.uri, new Position(0, 0), template);

	await workspace.applyEdit(edit);
	await document?.save();
}
