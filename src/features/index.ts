import { languages } from "vscode";
import { provideCodeActions } from "./codeActions";
import { provideCodeLenses } from "./codeLens";
import { provideCompletionItems } from "./completions";
import { provideDocumentLinks } from "./links";

export * as diagnostics from "./diagnostics";

const selector = { language: "ignore", scheme: "file" };
const triggers = ["/", "*", ".", "(", "~", "!", "#", "$", "@"];

export const providers = [
	languages.registerCodeActionsProvider(selector, { provideCodeActions }),
	languages.registerCodeLensProvider(selector, { provideCodeLenses }),
	languages.registerCompletionItemProvider(selector, { provideCompletionItems }, ...triggers),
	languages.registerDocumentLinkProvider(selector, { provideDocumentLinks }),
];
