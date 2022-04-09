interface IgnoreLanguage {
	readonly filename: string;
	readonly name: string;
}

const LANGUAGE_FLAVORS = [
	["Alex"],
	["Bazaar", "bzr"],
	["Concurrent Versions System", "cvs"],
	["Chef"],
	["Cloud Foundry", "cf"],
	["Darcs", "boring"],
	["DeployHQ", "deploy"],
	["Docker"],
	["ESLint"],
	["Elastic Beanstalk", "eb"],
	["Eleventy"],
	["Floobits", "floo"],
	["Git"],
	["Google Cloud", "gcloud"],
	["JSHint"],
	["Jetpack", "jpm"],
	["Kubernetes Helm", "helm"],
	["markdownlint"],
	["Mercurial", "hg"],
	["Monotone", "mtn-"],
	["npm"],
	["Nodemon"],
	["Nuxt"],
	["Perforce", "p4"],
	["Prettier"],
	["Heroku Slug Compiler", "slug"],
	["Solhint"],
	["Stylelint"],
	["Stylint"],
	["Swagger Codegen", "swagger-codegen-"],
	["Syncthing", "st"],
	["Team Foundation", "tf"],
	["Tokei"],
	["Up"],
	["Visual Studio Code", "vscode"],
	["Vercel"],
	["Yarn"],
];

export const flavors = LANGUAGE_FLAVORS.map<IgnoreLanguage>(([name, ext]) => ({
	filename: `.${(ext ?? name).toLowerCase()}ignore`,
	name,
}));
