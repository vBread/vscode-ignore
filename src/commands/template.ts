import { request } from '@octokit/request';
import { Position, Uri, window, workspace, WorkspaceEdit } from 'vscode';

const templates: string[] = [];
const cache = new Map<string, string>();

export async function fetchTemplate() {
  if (!templates.length) {
    templates.push(...(await request("GET /gitignore/templates")).data);
  }

  const name = await window.showQuickPick(templates, { placeHolder: "Select a template" });
  if (!name) return;

  if (cache.has(name)) {
    return cache.get(name)!;
  }

  const source = (await request("GET /gitignore/templates/{name}", { name })).data.source;
  cache.set(name, source);
  return source
}

export async function template(uri?: Uri) {
  uri ??= window.activeTextEditor!.document.uri;

  if (!uri) {
    window.showErrorMessage('Could not add template, no Active Document')
    return
  }

  const source = await fetchTemplate()

  if (!source) return

  const edit = new WorkspaceEdit();
  edit.insert(uri, new Position(0, 0), source);
  workspace.applyEdit(edit);
}

