import fs from "fs/promises";
import path from "path";
import { window, workspace, type Uri } from "vscode";

export async function ignorePath(uri?: Uri): Promise<void> {
	uri ??= window.activeTextEditor?.document.uri;

	if (!uri) {
		return void (await window.showErrorMessage("No active text editor"));
	}

	const ignoreFiles = await workspace.findFiles(".*ignore");
	const toIgnore = path.basename(uri.fsPath);

	if (!ignoreFiles.length) {
		return void (await window.showInformationMessage(
			"No .ignore files found in the current workspace"
		));
	}

	if (ignoreFiles.length === 1) {
		return await fs.appendFile(ignoreFiles[0].fsPath, toIgnore);
	}

	const files = await window.showQuickPick(
		ignoreFiles.map((file) => ({
			label: path.basename(file.fsPath),
			description: file.fsPath,
		})),
		{ canPickMany: true }
	);

	if (!files) return;

	for (const file of files) {
		await fs.appendFile(file.description, toIgnore);
	}
}
