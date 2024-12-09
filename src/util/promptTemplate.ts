import { window } from "vscode";

let request: typeof import("@octokit/request").request;
let templates: string[] | null = null;

const cache = new Map<string, string>();

export async function promptTemplate(): Promise<string | void> {
	request ??= (await import("@octokit/request")).request;
	templates ??= (await request("GET /gitignore/templates")).data;

	const name = await window.showQuickPick(templates, {
		placeHolder: "Select a template",
	});
	if (!name) return;

	if (cache.has(name)) {
		return cache.get(name);
	}

	const { data: template } = await request("GET /gitignore/templates/{name}", { name });
	cache.set(name, template.source);

	return template.source;
}
