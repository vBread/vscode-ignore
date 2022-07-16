import fs from "fs/promises";
import path from "path";
import { window, workspace, type Uri } from "vscode";

export default async function (uri?: Uri): Promise<void> {
	uri ??= window.activeTextEditor?.document.uri;

	if (!uri) {
		return void (await window.showErrorMessage("Could not ignore path, no active text editor"));
	}

	const ignoreFiles = await workspace.findFiles(".*ignore");
	const toIgnore = path.basename(uri.fsPath);

	if (!ignoreFiles.length) {
		return void (await window.showInformationMessage(
			"No .ignore files found in the current workspace"
		));
	}

	let files = await window.showQuickPick(
		ignoreFiles.map((file) => ({
			label: path.basename(file.fsPath),
			description: file.fsPath,
		})),
		{ canPickMany: true }
	);

	if (ignoreFiles.length === 1) {
		files = [{ label: "", description: ignoreFiles[0].fsPath }];
	}

	if (!files) return;

	for (const file of files) {
		/* eslint-disable @typescript-eslint/no-non-null-assertion */
		const contents = await fs.readFile(file.description!);

		await fs.appendFile(file.description!, `${contents ? "\n" : ""}${toIgnore}`);
	}
}
