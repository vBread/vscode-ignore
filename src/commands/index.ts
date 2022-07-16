import { commands } from "vscode";

import chooseTemplate from "./chooseTemplate";
import ignorePath from "./ignorePath";
import newFile from "./newFile";

export default [
	commands.registerCommand("ignore.chooseTemplate", chooseTemplate),
	commands.registerCommand("ignore.ignorePath", ignorePath),
	commands.registerCommand("ignore.newFile", newFile),
];
