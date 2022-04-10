import { request } from "@octokit/request";
import fs from "fs/promises";
import path from "path";
import { Uri, window, workspace } from "vscode";
import { flavors } from "../language/flavors";

const templates: string[] = [];
const cache = new Map<string, string>();

export async function newFile(uri?: Uri): Promise<void> {
	uri ??= workspace.getWorkspaceFolder(window.activeTextEditor!.document.uri)?.uri;
	if (!uri) return;

	const type = (
		await window.showQuickPick(
			[
				{ label: "Empty", detail: "Create an empty file" },

				{ label: "Template", detail: "Create a file from GitHub's collection of .gitignore templates" },
			],
			{ placeHolder: "Select a creation method" }
		)
	)?.label;
	if (!type) return;

	let source = "";

	if (type === "Template") {
		if (!templates.length) {
			templates.push(...(await request("GET /gitignore/templates")).data);
		}

		const name = await window.showQuickPick(templates, { placeHolder: "Select a template" });
		if (!name) return;

		if (cache.has(name)) {
			source = cache.get(name)!;
		} else {
			source = (await request("GET /gitignore/templates/{name}", { name })).data.source;
			cache.set(name, source);
		}
	}

	const filename = (
		await window.showQuickPick(
			flavors.map((flavor) => ({ label: flavor.filename, description: flavor.name })),
			{
				placeHolder: "Select a filename",
			}
		)
	)?.label;
	if (!filename) return;

	const target = path.resolve(uri.fsPath, filename);

	try {
		await fs.stat(target);

		const config = workspace.getConfiguration("ignore");

		if (config.newFileConflictBehavior === "prompt") {
			const action = await window.showErrorMessage(
				`A "${filename}" file already exists. Would you like to overwrite or append it?`,
				"Overwrite",
				"Append",
				"Cancel"
			);

			if (!action || action === "Cancel") return;

			throw action.toLowerCase();
		}

		throw config.newFileConflictBehavior;
	} catch (error: unknown) {
		if (error instanceof Error) {
			error = "overwrite";
		}

		if (typeof error === "string") {
			if (error === "overwrite") {
				await fs.writeFile(target, source);
			} else {
				await fs.appendFile(target, source);
			}

			await window.showTextDocument(Uri.parse(target));
		}
	}
}
