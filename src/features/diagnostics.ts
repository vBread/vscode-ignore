import { type Diagnostic, DiagnosticSeverity, languages, type TextDocument } from "vscode";
import { type IgnoreFile, type IgnorePattern, parse, PatternType } from "../language/parse";
import { getConfig, type LintSeverity } from "../util";

export const collection = languages.createDiagnosticCollection("ignore");

export enum DiagnosticCode {
	CoveredPattern = "covered-pattern",
	DuplicatePattern = "duplicate-pattern",
	UnusedPattern = "unused-pattern",
}

export async function update(document: TextDocument): Promise<void> {
	const { lint } = getConfig();
	const file = await parse(document);

	collection.set(document.uri, [
		...checkCoveredPatterns(file, convertSeverity(lint.coveredPatterns)),
		...checkDuplicatePatterns(file, convertSeverity(lint.duplicatePatterns)),
		...checkUnusedPatterns(file, convertSeverity(lint.unusedPatterns)),
	]);
}

function checkCoveredPatterns(file: IgnoreFile, severity: number): Diagnostic[] {
	if (severity === -1) return [];

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
				severity,
				range: problem.range,
				message: `'${problem.text}' is covered by '${original.text}'`,
				source: "ignore",
			},
		],
		[],
	);
}

function checkDuplicatePatterns(file: IgnoreFile, severity: number): Diagnostic[] {
	if (severity === -1) return [];

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
				severity,
				range: patterns[i].range,
				message: `'${patterns[i].text}' is defined more than once`,
				source: "ignore",
			});
		}
	}

	return diagnostics;
}

function checkUnusedPatterns(file: IgnoreFile, severity: number): Diagnostic[] {
	if (severity === -1) return [];

	return file.patterns
		.filter((pattern) => pattern.type === PatternType.Pattern)
		.reduce<Diagnostic[]>((diags, pattern) => {
			if (!pattern.matches.length) {
				diags.push({
					code: DiagnosticCode.UnusedPattern,
					severity,
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

function convertSeverity(level: LintSeverity) {
	switch (level) {
		case "off":
			return -1;
		case "warn":
			return DiagnosticSeverity.Warning;
		case "error":
			return DiagnosticSeverity.Error;
	}
}
