import { type CodeAction, CodeActionKind, type CodeActionProvider, WorkspaceEdit } from "vscode";

export const provideCodeActions: CodeActionProvider["provideCodeActions"] = async (
	document,
	_range,
	context,
	_token,
) => {
	const actions: CodeAction[] = [];

	for (const diagnostic of context.diagnostics) {
		// We don't need to check the code since each diagnostic
		// can be solved by removing the pattern

		const edit = new WorkspaceEdit();
		edit.delete(document.uri, diagnostic.range);

		const [adjective] = (diagnostic.code as string).split("-");

		actions.push({
			kind: CodeActionKind.QuickFix,
			title: `Remove ${adjective} pattern`,
			diagnostics: [diagnostic],
			isPreferred: true,
			edit,
		});
	}

	return actions;
};
