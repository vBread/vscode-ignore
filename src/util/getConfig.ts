import { workspace, type WorkspaceConfiguration } from "vscode";

export type LintSeverity = "off" | "warn" | "error";

interface IgnoreConfiguration extends WorkspaceConfiguration {
	lint: IgnoreLintConfiguration;
	newFileConflictBehavior: "append" | "overwrite" | "prompt";
	promptOnEmptyFile: boolean;
}

interface IgnoreLintConfiguration {
	coveredPatterns: LintSeverity;
	duplicatePatterns: LintSeverity;
	unusedPatterns: LintSeverity;
}

export const getConfig = () => workspace.getConfiguration("ignore") as IgnoreConfiguration;
