import fs from "node:fs/promises";
import path from "node:path";
import { type Uri, window, workspace } from "vscode";

export async function ignorePath(uri?: Uri): Promise<void> {
	uri ??= window.activeTextEditor?.document.uri;

	if (!uri) {
		await window.showErrorMessage("Could not ignore path, no active text editor");
		return;
	}

	const cwd = workspace.getWorkspaceFolder(uri)?.uri.fsPath;

	if (!cwd) {
		await window.showErrorMessage("Could not ignore path, file is not in a workspace");
		return;
	}

	const ignoreFiles = await workspace.findFiles(".*ignore");
	const toIgnore = path.relative(cwd, uri.fsPath).replaceAll(path.sep, path.posix.sep);

	if (!ignoreFiles.length) {
		await window.showInformationMessage("No .ignore files found in the current workspace");
		return;
	}

	let files = await window.showQuickPick(
		ignoreFiles.map((file) => ({
			label: path.basename(file.fsPath),
			description: file.fsPath,
		})),
		{ canPickMany: true },
	);

	if (ignoreFiles.length === 1) {
		files = [{ label: "", description: ignoreFiles[0].fsPath }];
	}

	if (!files) return;

	for (const file of files) {
		const contents = await fs.readFile(file.description!);

		await fs.appendFile(file.description!, `${contents ? "\n" : ""}${toIgnore}`);
	}
}
