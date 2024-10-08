import { type Diagnostic, DiagnosticSeverity, languages, type TextDocument } from "vscode";
import { EntryType, type IgnoreEntry, type IgnoreFile, parse } from "../language/parse";

export const collection = languages.createDiagnosticCollection("ignore");

export enum DiagnosticCode {
	CoveredEntry = "covered-entry",
	DuplicateEntry = "duplicate-entry",
	UnusedEntry = "unused-entry",
}

export async function update(document: TextDocument): Promise<void> {
	const file = await parse(document);

	collection.set(document.uri, [
		...checkCoveredEntries(file),
		...checkDuplicateEntries(file),
		...checkUnusedEntries(file),
	]);
}

function checkDuplicateEntries(file: IgnoreFile): Diagnostic[] {
	const duplicates = new Map<string, IgnoreEntry[]>();
	const diagnostics: Diagnostic[] = [];

	for (const entry of file.entries) {
		if (duplicates.has(entry.text)) {
			duplicates.get(entry.text)!.push(entry);
		} else {
			duplicates.set(entry.text, [entry]);
		}
	}

	for (const entries of duplicates.values()) {
		if (entries.length === 1) continue;

		for (let i = 0; i < entries.length; i++) {
			// Skip first entry, report on subsequent
			if (i === 0) continue;

			diagnostics.push({
				code: DiagnosticCode.DuplicateEntry,
				severity: DiagnosticSeverity.Warning,
				range: entries[i].range,
				message: `'${entries[i].text}' is defined more than once`,
				source: "ignore",
			});
		}
	}

	return diagnostics;
}

function checkCoveredEntries(file: IgnoreFile): Diagnostic[] {
	const entries = file.entries.filter((entry) => entry.type !== EntryType.Comment);

	const ignored = new Set<string>();
	const unignored = new Set<string>();

	let intersection: Set<string>;

	const map = new Map<IgnoreEntry, Set<string>>();
	const matchedMap = new Map<IgnoreEntry, Set<string>>();

	const covered: [IgnoreEntry, IgnoreEntry][] = [];

	for (const entry of file.entries) {
		matchedMap.set(entry, new Set(entry.matches));
	}

	for (const entry of entries) {
		const matched = matchedMap.get(entry);
		if (!matched) continue;

		if (!entry.isNegated) {
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

			if (entry.isNegated === recent.isNegated) {
				if (recentValues.isSupersetOf(matched)) {
					covered.push([recent, entry]);
				} else if (matched.isSupersetOf(recentValues)) {
					covered.push([entry, recent]);
				}
			} else if (intersection.isSupersetOf(recentValues)) {
				covered.push([entry, recent]);
			}
		}

		map.set(entry, matched);
	}

	return covered.reduce<Diagnostic[]>(
		(diags, [original, problem]) => [
			...diags,
			{
				code: DiagnosticCode.CoveredEntry,
				severity: DiagnosticSeverity.Warning,
				range: problem.range,
				message: `'${problem.text}' is covered by '${original.text}'`,
				source: "ignore",
			},
		],
		[],
	);
}

function checkUnusedEntries(file: IgnoreFile): Diagnostic[] {
	return file.entries
		.filter((entry) => entry.type === EntryType.Pattern)
		.reduce<Diagnostic[]>((diags, entry) => {
			if (!entry.matches.length) {
				diags.push({
					code: DiagnosticCode.UnusedEntry,
					severity: DiagnosticSeverity.Warning,
					range: entry.range,
					message: `'${entry.text}' is unused`,
					source: "ignore",
				});
			}

			return diags;
		}, []);
}

function removeAll(source: Set<string>, other: Set<string>) {
	let removed = false;

	for (const entry of other) {
		if (source.delete(entry) && !removed) {
			removed = true;
		}
	}

	return removed;
}
