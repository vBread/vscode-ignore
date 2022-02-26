interface IgnoreLanguage {
	readonly filename: string;
	readonly name: string;
}

function createFlavor(name: string, extension = name): IgnoreLanguage {
	return { filename: `.${extension.toLowerCase()}ignore`, name };
}

export const flavors = [
	createFlavor('Alex'),
	createFlavor('Bazaar', 'bzr'),
	createFlavor('Bazel'),
	createFlavor('Concurrent Versions System', 'cvs'),
	createFlavor('Chef'),
	createFlavor('Cloud Foundry', 'cf'),
	createFlavor('Darcs', 'boring'),
	createFlavor('DeployHQ', 'deploy'),
	createFlavor('Docker'),
	createFlavor('ESLint'),
	createFlavor('Elastic Beanstalk', 'eb'),
	createFlavor('Eleventy'),
	createFlavor('Floobits', 'floo'),
	createFlavor('Git'),
	createFlavor('Google Cloud', 'gcloud'),
	createFlavor('JSHint'),
	createFlavor('Jetpack', 'jpm'),
	createFlavor('Kubernetes Helm', 'helm'),
	createFlavor('markdownlint'),
	createFlavor('Mercurial', 'hg'),
	createFlavor('Monotone', 'mtn-'),
	createFlavor('npm'),
	createFlavor('Nodemon'),
	createFlavor('Nuxt'),
	createFlavor('Perforce', 'p4'),
	createFlavor('Prettier'),
	createFlavor('Heroku Slug Compiler', 'slug'),
	createFlavor('Solhint'),
	createFlavor('Stylelint'),
	createFlavor('Stylint'),
	createFlavor('Swagger Codegen', 'swagger-codegen-'),
	createFlavor('Syncthing', 'st'),
	createFlavor('Team Foundation', 'tf'),
	createFlavor('Tokei'),
	createFlavor('Up'),
	createFlavor('Visual Studio Code', 'vscode'),
	createFlavor('Vercel'),
	createFlavor('Yarn'),
];
