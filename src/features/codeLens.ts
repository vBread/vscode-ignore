import { CodeLens, type CodeLensProvider, Location, Position, Range } from "vscode";
import { parse } from "../language/parse";

export const provideCodeLenses: CodeLensProvider["provideCodeLenses"] = async (
	document,
	_token,
) => {
	const file = await parse(document);
	const codeLens: CodeLens[] = [];

	for (const pattern of file.patterns) {
		if (!pattern.matches || pattern.isDirectory) continue;

		const matches = pattern.matches.length;

		codeLens.push(
			new CodeLens(pattern.range, {
				title: `${matches} ${matches === 1 ? "match" : "matches"}`,
				command: "editor.action.peekLocations",
				arguments: [
					document.uri,
					pattern.range.start,
					pattern.matches.map(
						(match) =>
							new Location(
								match.uri,
								new Range(new Position(0, 0), new Position(0, 0)),
							),
					),
					"peek",
				],
			}),
		);
	}

	return codeLens;
};
