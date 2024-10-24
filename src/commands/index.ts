import { commands as vscCommands } from "vscode";
import { chooseTemplate } from "./chooseTemplate";
import { ignorePath } from "./ignorePath";
import { newFile } from "./newFile";

export const commands = [
	vscCommands.registerCommand("ignore.chooseTemplate", chooseTemplate),
	vscCommands.registerCommand("ignore.ignorePath", ignorePath),
	vscCommands.registerCommand("ignore.newFile", newFile),
];
