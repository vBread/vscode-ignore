# VSCode Ignore

Minimal port of [idea-gitignore](https://github.com/JetBrains/idea-gitignore).

## Features

- Syntax highlighting
- Path completions
- Diagnostics for covered, duplicate, and unused patterns
- Code lenses
- Creating ignore files from templates
- <details>
  <summary>
	  Support for 40 <code>.*ignore</code> files
  </summary>
  <br>

  | Filename                                                                                                                       | Tool                                                                                                                                       |
  | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
  | [`.alexignore`](https://github.com/get-alex/alex#alexignore)                                                                   | [alex](https://alexjs.com/)                                                                                                                |
  | [`.bazelignore`](https://bazel.build/run/bazelrc#bazelignore)                                                                  | [Bazel](https://bazel.build/)                                                                                                              |
  | [`.boringignore`](http://darcs.net/Using/Configuration#boring)                                                                 | [Darcs](http://darcs.net/)                                                                                                                 |
  | [`.bzrignore`](http://doc.bazaar.canonical.com/bzr.dev/en/user-reference/ignore-help.html?highlight=ignore)                    | [Bazaar](http://bazaar.canonical.com/en/)                                                                                                  |
  | [`.cfignore`](https://docs.cloudfoundry.org/devguide/deploy-apps/prepare-to-deploy.html#exclude)                               | [Cloud Foundry](https://www.cloudfoundry.org/)                                                                                             |
  | [`.chefignore`](https://docs.chef.io/chef_repo/#chefignore-files)                                                              | [Chef](https://www.chef.io/)                                                                                                               |
  | [`.cvsignore`](https://www.gnu.org/software/trans-coord/manual/cvs/html_node/cvsignore.html)                                   | [Concurrent Versions System](https://www.gnu.org/software/trans-coord/manual/cvs/html_node/What-is-CVS_003f.html#What-is-CVS_003f)         |
  | [`.deployignore`](https://www.deployhq.com/support/excluded-files#deployignore)                                                | [DeployHQ](https://www.deployhq.com/)                                                                                                      |
  | [`.distignore`](https://developer.wordpress.org/cli/commands/dist-archive/)                                                    | [WordPress CLI](https://developer.wordpress.org/cli/commands/)                                                                             |
  | [`.dockerignore`](https://docs.docker.com/engine/reference/builder/#dockerignore-file)                                         | [Docker](https://www.docker.com/)                                                                                                          |
  | [`.ebignore`](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html#eb-cli3-ebignore)              | [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/)                                                                          |
  | [`.eleventyignore`](https://www.11ty.dev/docs/ignores/#ignore-template-files)                                                  | [Eleventy](https://www.11ty.dev/)                                                                                                          |
  | [`.eslintignore`](https://eslint.org/docs/user-guide/configuring/ignoring-code#the-eslintignore-file)                          | [ESLint](https://eslint.org/)                                                                                                              |
  | `.flooignore`                                                                                                                  | [Floobits](https://floobits.com/)                                                                                                          |
  | [`.gcloudignore`](https://cloud.google.com/sdk/gcloud/reference/topic/gcloudignore)                                            | [Google Cloud](https://cloud.google.com/)                                                                                                  |
  | [`.gitignore`](https://git-scm.com/docs/gitignore)                                                                             | [Git](https://git-scm.com/)                                                                                                                |
  | [`.helmignore`](https://helm.sh/docs/chart_template_guide/helm_ignore_file/)                                                   | [Helm](https://helm.sh/)                                                                                                                   |
  | [`.hgignore`](https://www.mercurial-scm.org/wiki/.hgignore)                                                                    | [Mercurial](https://www.mercurial-scm.org/)                                                                                                |
  | [`.jpmignore`](https://udn.realityripple.com/docs/Archive/Add-ons/Add-on_SDK/Tools/jpmignore)                                  | [Mozilla Jetpack](https://wiki.mozilla.org/Jetpack)                                                                                        |
  | [`.jshintignore`](https://jshint.com/docs/cli/#ignoring-files)                                                                 | [JSHint](https://jshint.com/about/)                                                                                                        |
  | `.markdownlintignore`                                                                                                          | [markdownlint](https://github.com/DavidAnson/markdownlint#markdownlint)                                                                    |
  | `.mtn-ignore`                                                                                                                  | [monotone](https://www.monotone.ca/)                                                                                                       |
  | `.nodemonignore`                                                                                                               | [nodemon](https://nodemon.io/)                                                                                                             |
  | [`.npmignore`](https://docs.npmjs.com/cli/v8/using-npm/developers#keeping-files-out-of-your-package)                           | [npm](https://docs.npmjs.com/about-npm)                                                                                                    |
  | [`.nuxtignore`](https://nuxtjs.org/docs/features/configuration#nuxtignore)                                                     | [Nuxt](https://nuxtjs.org/)                                                                                                                |
  | [`.p4ignore`](https://www.perforce.com/manuals/cmdref/Content/CmdRef/P4IGNORE.html)                                            | [Perforce](https://www.perforce.com/)                                                                                                      |
  | [`.prettierignore`](https://prettier.io/docs/en/ignore.html#ignoring-files-prettierignore)                                     | [Prettier](https://prettier.io/)                                                                                                           |
  | [`.slugignore`](https://devcenter.heroku.com/articles/slug-compiler#ignoring-files-with-slugignore)                            | [Heroku Slug Compiler](https://devcenter.heroku.com/articles/slug-compiler)                                                                |
  | `.solhintignore`                                                                                                               | [Solhint](https://protofire.github.io/solhint/)                                                                                            |
  | [`.stylelintignore`](https://stylelint.io/user-guide/ignore-code#files-entirely)                                               | [Stylelint](https://stylelint.io/)                                                                                                         |
  | [`.stylintignore`](https://github.com/SimenB/stylint#stylintignore)                                                            | [Stylint](https://simenb.github.io/stylint/)                                                                                               |
  | [`.swagger-codegen-ignore`](https://github.com/swagger-api/swagger-codegen/#ignore-file-format)                                | [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)                                                                               |
  | [`.stignore`](https://docs.syncthing.net/users/ignoring.html)                                                                  | [Syncthing](https://syncthing.net/)                                                                                                        |
  | `.terraformignore`                                                                                                             | [Terraform](https://www.terraform.io/)                                                                                                     |
  | [`.tfignore`](https://docs.microsoft.com/en-us/azure/devops/repos/tfvc/add-files-server?view=azure-devops#tfignore-file-rules) | [Team Foundation](https://docs.microsoft.com/en-us/azure/devops/repos/tfvc/what-is-tfvc?view=azure-devops#team-foundation-version-control) |
  | [`.tokeignore`](https://github.com/XAMPPRocky/tokei#excluding-folders)                                                         | [Tokei](https://github.com/XAMPPRocky/tokei#readme)                                                                                        |
  | [`.upignore`](https://apex.sh/docs/up/configuration/#ignoring_files)                                                           | [Up](https://apex.sh/docs/up/)                                                                                                             |
  | [`.vercelignore`](https://vercel.com/guides/prevent-uploading-sourcepaths-with-vercelignore)                                   | [Vercel](https://vercel.com/)                                                                                                              |
  | [`.vscodeignore`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#using-.vscodeignore)          | [VSCode Extension API](https://code.visualstudio.com/api)                                                                                  |
  | `.yarnignore`                                                                                                                  | [Yarn](https://yarnpkg.com/)                                                                                                               |

  </details>
