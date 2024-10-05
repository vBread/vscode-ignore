import { languages } from "vscode";
import { provideCompletionItems } from "./completions";
import { provideDocumentLinks } from "./links";

const selector = { language: "ignore", scheme: "file" };
const triggers = ["/", "*", ".", "(", "~", "!", "#", "$", "@"];

export const providers = [
	languages.registerCompletionItemProvider(selector, { provideCompletionItems }, ...triggers),
	languages.registerDocumentLinkProvider(selector, { provideDocumentLinks }),
];
