import { workspace, type WorkspaceConfiguration } from "vscode";

interface IgnoreConfiguration extends WorkspaceConfiguration {
	newFileConflictBehavior: "append" | "overwrite" | "prompt";
	promptOnEmptyFile: boolean;
}

export const getConfig = () => workspace.getConfiguration("ignore") as IgnoreConfiguration;
