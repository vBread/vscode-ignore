import { request } from '@octokit/request';
import fs from 'fs';
import { resolve } from 'path';
import { Uri, window, workspace } from 'vscode';
import { flavors } from '../language/flavors';

export async function newFile(uri?: Uri): Promise<void> {
	uri ??= workspace.getWorkspaceFolder(window.activeTextEditor!.document.uri)?.uri;

	if (!uri) return;

	const config = workspace.getConfiguration('ignore');

	const templates = (await request('GET /gitignore/templates')).data;
	const name = await window.showQuickPick(templates, { placeHolder: 'Select a template' });

	if (!name) return;

	const template = (await request('GET /gitignore/templates/{name}', { name })).data;
	const filename = (
		await window.showQuickPick(
			flavors.map((flavor) => ({ label: flavor.filename, description: flavor.name })),
			{
				placeHolder: 'Select a filename',
			}
		)
	)?.label;

	if (!filename) return;

	const target = resolve(uri.fsPath, filename);

	if (fs.existsSync(target) && !config.alwaysOverwriteExistingFiles) {
		const shouldOverwrite = await window.showErrorMessage(
			`A '${filename}' file already exists. Would you like to overwrite it?`,
			'Yes',
			'No'
		);

		if (!shouldOverwrite || shouldOverwrite === 'No') return;
	}

	await fs.promises.writeFile(target, template.source);
	await window.showTextDocument(Uri.parse(target));
}
