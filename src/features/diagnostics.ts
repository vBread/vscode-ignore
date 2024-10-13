import { type Diagnostic, DiagnosticSeverity, languages, type TextDocument } from "vscode";
import { type IgnoreFile, type IgnorePattern, parse, PatternType } from "../language/parse";

export const collection = languages.createDiagnosticCollection("ignore");

export enum DiagnosticCode {
	CoveredPattern = "covered-pattern",
	DuplicatePattern = "duplicate-pattern",
	UnusedPattern = "unused-pattern",
}

export async function update(document: TextDocument): Promise<void> {
	const file = await parse(document);

	collection.set(document.uri, [
		...checkCoveredPatterns(file),
		...checkDuplicatePatterns(file),
		...checkUnusedPatterns(file),
	]);
}

function checkDuplicatePatterns(file: IgnoreFile): Diagnostic[] {
	const duplicates = new Map<string, IgnorePattern[]>();
	const diagnostics: Diagnostic[] = [];

	for (const pattern of file.patterns) {
		if (duplicates.has(pattern.text)) {
			duplicates.get(pattern.text)!.push(pattern);
		} else {
			duplicates.set(pattern.text, [pattern]);
		}
	}

	for (const patterns of duplicates.values()) {
		if (patterns.length === 1) continue;

		for (let i = 0; i < patterns.length; i++) {
			// Skip first pattern, report on subsequent
			if (i === 0) continue;

			diagnostics.push({
				code: DiagnosticCode.DuplicatePattern,
				severity: DiagnosticSeverity.Warning,
				range: patterns[i].range,
				message: `'${patterns[i].text}' is defined more than once`,
				source: "ignore",
			});
		}
	}

	return diagnostics;
}

function checkCoveredPatterns(file: IgnoreFile): Diagnostic[] {
	const patterns = file.patterns.filter((pattern) => pattern.type !== PatternType.Comment);

	const ignored = new Set<string>();
	const unignored = new Set<string>();

	let intersection: Set<string>;

	const map = new Map<IgnorePattern, Set<string>>();
	const matchedMap = new Map<IgnorePattern, Set<string>>();

	const covered: [IgnorePattern, IgnorePattern][] = [];

	for (const pattern of file.patterns) {
		matchedMap.set(pattern, new Set(pattern.matches));
	}

	for (const pattern of patterns) {
		const matched = matchedMap.get(pattern);
		if (!matched) continue;

		if (!pattern.isNegated) {
			matched.forEach((path) => ignored.add(path));
			intersection = unignored.intersection(matched);

			if (removeAll(unignored, intersection)) {
				continue;
			}
		} else {
			matched.forEach((path) => unignored.add(path));
			intersection = ignored.intersection(matched);

			if (removeAll(ignored, intersection)) {
				continue;
			}
		}

		for (const recent of map.keys()) {
			const recentValues = map.get(recent);

			if (!recentValues?.size || !matched.size) {
				continue;
			}

			if (pattern.isNegated === recent.isNegated) {
				if (recentValues.isSupersetOf(matched)) {
					covered.push([recent, pattern]);
				} else if (matched.isSupersetOf(recentValues)) {
					covered.push([pattern, recent]);
				}
			} else if (intersection.isSupersetOf(recentValues)) {
				covered.push([pattern, recent]);
			}
		}

		map.set(pattern, matched);
	}

	return covered.reduce<Diagnostic[]>(
		(diags, [original, problem]) => [
			...diags,
			{
				code: DiagnosticCode.CoveredPattern,
				severity: DiagnosticSeverity.Warning,
				range: problem.range,
				message: `'${problem.text}' is covered by '${original.text}'`,
				source: "ignore",
			},
		],
		[],
	);
}

function checkUnusedPatterns(file: IgnoreFile): Diagnostic[] {
	return file.patterns
		.filter((pattern) => pattern.type === PatternType.Pattern)
		.reduce<Diagnostic[]>((diags, pattern) => {
			if (!pattern.matches.length) {
				diags.push({
					code: DiagnosticCode.UnusedPattern,
					severity: DiagnosticSeverity.Warning,
					range: pattern.range,
					message: `'${pattern.text}' is unused`,
					source: "ignore",
				});
			}

			return diags;
		}, []);
}

function removeAll(source: Set<string>, other: Set<string>) {
	let removed = false;

	for (const pattern of other) {
		if (source.delete(pattern) && !removed) {
			removed = true;
		}
	}

	return removed;
}
