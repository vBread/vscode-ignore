import { languages, type DocumentSelector } from "vscode";

import provideCompletionItems from "./completions";

const selector: DocumentSelector = { language: "ignore", scheme: "file" };
const triggers = ["/", "*", ".", "(", "~", "!", "#", "$", "@"];

export default [
	languages.registerCompletionItemProvider(selector, { provideCompletionItems }, ...triggers),
];
