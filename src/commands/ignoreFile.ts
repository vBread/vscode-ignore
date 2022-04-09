import fs from "fs/promises";
import { basename } from "path";
import { Uri, window, workspace } from "vscode";

export async function ignoreFile(uri?: Uri): Promise<void> {
	uri ??= window.activeTextEditor?.document.uri;

	if (!uri) {
		return void (await window.showErrorMessage("No active text editor"));
	}

	const ignoreFiles = await workspace.findFiles(".*ignore");
	const toIgnore = basename(uri.fsPath);

	if (ignoreFiles.length === 1) {
		return await append(ignoreFiles[0].fsPath, toIgnore);
	}

	const files = await window.showQuickPick(
		ignoreFiles.map((file) => ({
			label: basename(file.fsPath),
			description: file.fsPath,
		})),
		{ canPickMany: true }
	);

	if (!files) return;

	for (const file of files) {
		await append(file.description, toIgnore);
	}
}

async function append(file: string, path: string): Promise<void> {
	const content = (await fs.readFile(file)).toString("utf8");

	await fs.appendFile(file, `${content === "" ? "" : "\n"}${path}`);
}
