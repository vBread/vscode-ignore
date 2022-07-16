import { request } from "@octokit/request";
import { window } from "vscode";

let templates: string[] | null = null;
const cache = new Map<string, string>();

export async function promptTemplate(): Promise<string | void> {
	templates ??= (await request("GET /gitignore/templates")).data;

	const name = await window.showQuickPick(templates, {
		placeHolder: "Select a template",
	});
	if (!name) return;

	if (cache.has(name)) {
		return cache.get(name);
	}

	const template = (await request("GET /gitignore/templates/{name}", { name })).data.source;
	cache.set(name, template);

	return template;
}
