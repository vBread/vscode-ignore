import fs, { type FileHandle } from "node:fs/promises";
import path from "node:path";
import { Uri, window, workspace } from "vscode";
import { flavors } from "../language/flavors";
import { getConfig, promptTemplate } from "../util";

export async function newFile(uri?: Uri): Promise<void> {
	const folder = window.activeTextEditor?.document.uri ?? workspace.workspaceFolders?.[0].uri;
	if (!folder) return;

	uri ??= workspace.getWorkspaceFolder(folder)?.uri;
	if (!uri) return;

	const selectedMethod = await window.showQuickPick(
		[
			{
				label: "Empty",
				detail: "Create an empty file",
			},
			{
				label: "Template",
				detail: "Create a file from GitHub's collection of .gitignore templates",
			},
		],
		{ placeHolder: "Select a creation method" },
	);

	if (!selectedMethod) return;

	let source = "";

	if (selectedMethod.label === "Template") {
		source = (await promptTemplate()) ?? "";
	}

	const selectedFile = await window.showQuickPick(
		flavors.map((flavor) => ({ label: flavor.filename, description: flavor.name })),
		{ placeHolder: "Select a filename" },
	);

	if (!selectedFile) return;

	const target = path.resolve(uri.fsPath, selectedFile.label);
	let file: FileHandle | undefined;

	try {
		file = await fs.open(target, "ax");
		file.writeFile(source);
	} catch {
		const config = getConfig();
		let behavior = "Overwrite";

		if (config.newFileConflictBehavior === "prompt") {
			const action = await window.showErrorMessage(
				`A "${selectedFile.label}" file already exists. Would you like to overwrite or append it?`,
				"Overwrite",
				"Append",
				"Cancel",
			);

			if (!action || action === "Cancel") return;
			behavior = action;
		}

		if (behavior === "Overwrite") {
			await file?.writeFile(source);
		} else {
			await file?.appendFile(source);
		}
	} finally {
		await window.showTextDocument(Uri.file(target));
		file?.close();
	}
}
