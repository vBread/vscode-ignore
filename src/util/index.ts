import path from "node:path";

export * from "./getConfig";
export * from "./promptTemplate";

export function isIgnoreFile(filename: string) {
	return /^\..+ignore$/.test(path.basename(filename));
}
