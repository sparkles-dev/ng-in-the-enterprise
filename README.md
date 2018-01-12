# Angular in the Enterprise

> Enterprise ... multi module ... enterprise ... large ... not small ... maven maven maven ... enterpre grade build tools ... gradle

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.3.

## Building multiple Angular apps through maven

Traditionally, maven's concept of modules and lifecycle phases doesn't fit very well to development in the node ecosystem.
Maven's idea is that each module describes itself in a `pom.xml` including its dependencies and the required build plugins who attach to the lifecycle.
A module may have multiple sub modules and, obviously, a sub module references its parent module.
Dependencies are installed to a local Maven repository on the user's machine.

In node and node-related package management – whether that is npm, yarn or pnpm – dependencies are listed in a `package.json`.
Running the package manager's install command, e.g. `yarn install`, resolves dependencies and copies a resolved dependency tree to a local `node_modules` folder.

#### Node vs. Maven

Node's `node_modules` folder is very different to a local Maven repository!
A local `node_modules` folder is on a per-package basis and installs resolved dependencies.
A local Maven repository is on a per-user basis and stores resolvable dependencies.

The most common pitfall in the enterprise world is the thinking of _"oh, the file name starts with a letter p and albeit it has a dot-json file ending it somehow looks like a pom.xml_.
That thinking led to enterprise-grade build set ups where you were tying each `pom.xml` to one `package.json` and thus forcing developers to resolving, extracting and copying dependencies to a `node_modules` folder – all file system operations on disk again and again and over again again...

A better idea is to treat the Node ecosystem as a first-class citizen in the project's workspace and let it install dependencies to a common `node_modules` folder.
In the node ecosystem, developers coined the term ["dependency hoisting" for such a strategy](https://github.com/lerna/lerna/issues/334).
The thinking should be that each Maven (sub-)module is related to one app configuration in the Angular CLI.
Check out the project's GitHub Wiki on [Multiple Apps integration in the Angular CLI](https://github.com/angular/angular-cli/wiki/stories-multiple-apps).


#### Running node through Maven

In the Maven ecosystem, the [Frontend Maven Plugin](https://github.com/eirslett/frontend-maven-plugin) enables to run Node and related Package Managers through maven.
The _'trick'_ here is to share one `node_modules` folder across several Maven modules.

The way to achieve such is to execute the Package Manager's install command in the parent Maven module,
while executing dedicated build commands for each sub module.
The parent's `pom.xml` looks like so:

```xml
    <modules>
        <module>apps/bar</module>
        <module>apps/foo</module>
        <module>apps/foo-bar</module>
    </modules>

    <build>
        <plugins>
            <plugin>
                <groupId>com.github.eirslett</groupId>
                <artifactId>frontend-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <id>install node and yarn</id>
                        <goals>
                            <goal>install-node-and-yarn</goal>
                        </goals>
                        <phase>generate-resources</phase>
                    </execution>
                    <execution>
                        <id>yarn install</id>
                        <goals>
                            <goal>yarn</goal>
                        </goals>
                        <configuration>
                            <arguments>install --frozen-lockfile --non-interactive</arguments>
                        </configuration>
                    </execution>
                </executions>
                <configuration>
                    <nodeVersion>v8.9.0</nodeVersion>
                    <yarnVersion>v1.3.2</yarnVersion>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

A sub module's `pom.xml` sets the working directory of the Frontend Maven Plugin to the project's root directory; i.e., equivalent to the Maven property `${pom.parent.basedir}`:

```xml
    <build>
        <plugins>
            <plugin>
                <groupId>com.github.eirslett</groupId>
                <artifactId>frontend-maven-plugin</artifactId>
                <!-- .. -->
                <configuration>
                    <workingDirectory>${pom.parent.basedir}</workingDirectory>
                </configuration>
            </plugin>
        </plugins>
    </build>
```


Let's build the Angular apps through maven:

```bash
$ mvn install
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Build Order:
[INFO] 
[INFO] minimal-pom
[INFO] angular-product-bar
[INFO] angular-product-foo
[INFO] angular-product-foo-bar
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building minimal-pom 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:install-node-and-yarn (install node and yarn) @ enterprise-grade-angular ---
[INFO] Node v8.9.0 is already installed.
[INFO] Yarn 1.3.2 is already installed.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn install) @ enterprise-grade-angular ---
[INFO] Running 'yarn install --frozen-lockfile --non-interactive' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn install v1.3.2
[INFO] [1/4] Resolving packages...
[INFO] success Already up-to-date.
[INFO] Done in 0.71s.
[INFO] 
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ enterprise-grade-angular ---
[INFO] Installing /home/david/Projects/github/dherges/ng-in-the-enterprise/pom.xml to /home/david/.m2/repository/com/enterprise/enterprise-grade-angular/1.0-SNAPSHOT/enterprise-grade-angular-1.0-SNAPSHOT.pom
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building angular-product-bar 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:install-node-and-yarn (install node and yarn) @ bar ---
[INFO] Node v8.9.0 is already installed.
[INFO] Yarn 1.3.2 is already installed.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn install) @ bar ---
[INFO] Running 'yarn install --frozen-lockfile --non-interactive' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn install v1.3.2
[INFO] [1/4] Resolving packages...
[INFO] success Already up-to-date.
[INFO] Done in 0.74s.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn build) @ bar ---
[INFO] Running 'yarn apps:bar:build' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn run v1.3.2
[INFO] $ ng build --app bar
[INFO] Date: 2018-01-12T15:48:38.264Z
[INFO] Hash: a6d04b951bcc789ed3db
[INFO] Time: 8761ms
[INFO] chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
[INFO] chunk {main} main.bundle.js, main.bundle.js.map (main) 7.85 kB [initial] [rendered]
[INFO] chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
[INFO] chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.4 kB [initial] [rendered]
[INFO] chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
[INFO] Done in 11.05s.
[INFO] 
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ bar ---
[INFO] Installing /home/david/Projects/github/dherges/ng-in-the-enterprise/apps/bar/pom.xml to /home/david/.m2/repository/com/enterprise/bar/1.0-SNAPSHOT/bar-1.0-SNAPSHOT.pom
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building angular-product-foo 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:install-node-and-yarn (install node and yarn) @ foo ---
[INFO] Node v8.9.0 is already installed.
[INFO] Yarn 1.3.2 is already installed.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn install) @ foo ---
[INFO] Running 'yarn install --frozen-lockfile --non-interactive' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn install v1.3.2
[INFO] [1/4] Resolving packages...
[INFO] success Already up-to-date.
[INFO] Done in 0.77s.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn build) @ foo ---
[INFO] Running 'yarn apps:foo:build' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn run v1.3.2
[INFO] $ ng build --app foo
[INFO] Date: 2018-01-12T15:48:49.963Z
[INFO] Hash: c74c6a1b18230624c8ba
[INFO] Time: 7823ms
[INFO] chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
[INFO] chunk {main} main.bundle.js, main.bundle.js.map (main) 8.33 kB [initial] [rendered]
[INFO] chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
[INFO] chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.4 kB [initial] [rendered]
[INFO] chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
[INFO] Done in 9.73s.
[INFO] 
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ foo ---
[INFO] Installing /home/david/Projects/github/dherges/ng-in-the-enterprise/apps/foo/pom.xml to /home/david/.m2/repository/com/enterprise/foo/1.0-SNAPSHOT/foo-1.0-SNAPSHOT.pom
[INFO]                                                                         
[INFO] ------------------------------------------------------------------------
[INFO] Building angular-product-foo-bar 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:install-node-and-yarn (install node and yarn) @ foo-bar ---
[INFO] Node v8.9.0 is already installed.
[INFO] Yarn 1.3.2 is already installed.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn install) @ foo-bar ---
[INFO] Running 'yarn install --frozen-lockfile --non-interactive' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn install v1.3.2
[INFO] [1/4] Resolving packages...
[INFO] success Already up-to-date.
[INFO] Done in 0.79s.
[INFO] 
[INFO] --- frontend-maven-plugin:1.6:yarn (yarn build) @ foo-bar ---
[INFO] Running 'yarn apps:foo-bar:build' in /home/david/Projects/github/dherges/ng-in-the-enterprise
[INFO] yarn run v1.3.2
[INFO] $ ng build --app foo-bar
[INFO] Date: 2018-01-12T15:49:01.996Z
[INFO] Hash: ac8253ed9d5c92c5ae42
[INFO] Time: 8043ms
[INFO] chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
[INFO] chunk {main} main.bundle.js, main.bundle.js.map (main) 8.45 kB [initial] [rendered]
[INFO] chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
[INFO] chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.5 kB [initial] [rendered]
[INFO] chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
[INFO] Done in 10.08s.
[INFO] 
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ foo-bar ---
[INFO] Installing /home/david/Projects/github/dherges/ng-in-the-enterprise/apps/foo-bar/pom.xml to /home/david/.m2/repository/com/enterprise/foo-bar/1.0-SNAPSHOT/foo-bar-1.0-SNAPSHOT.pom
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO] 
[INFO] minimal-pom ........................................ SUCCESS [  2.210 s]
[INFO] angular-product-bar ................................ SUCCESS [ 12.776 s]
[INFO] angular-product-foo ................................ SUCCESS [ 11.758 s]
[INFO] angular-product-foo-bar ............................ SUCCESS [ 11.989 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 39.024 s
[INFO] Finished at: 2018-01-12T16:49:02+01:00
[INFO] Final Memory: 10M/217M
[INFO] ------------------------------------------------------------------------
```

#### The classic CLI commands

Though our project is now ready to be rocketed into enterprise-grade heaven, frontend developers still got the love of running their memoized and favourite commands on the shell of their choice.
Let's do that!

```bash
$ ng build --app foo && ng build --app bar && ng build --app foo-bar 
Date: 2018-01-12T16:08:36.058Z                                                          
Hash: c74c6a1b18230624c8ba
Time: 7337ms
chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
chunk {main} main.bundle.js, main.bundle.js.map (main) 8.33 kB [initial] [rendered]
chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.4 kB [initial] [rendered]
chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
Date: 2018-01-12T16:08:45.721Z                                                          
Hash: a6d04b951bcc789ed3db
Time: 7835ms
chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
chunk {main} main.bundle.js, main.bundle.js.map (main) 7.85 kB [initial] [rendered]
chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.4 kB [initial] [rendered]
chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
Date: 2018-01-12T16:08:55.630Z                                                          
Hash: ac8253ed9d5c92c5ae42
Time: 7817ms
chunk {inline} inline.bundle.js, inline.bundle.js.map (inline) 5.83 kB [entry] [rendered]
chunk {main} main.bundle.js, main.bundle.js.map (main) 8.45 kB [initial] [rendered]
chunk {polyfills} polyfills.bundle.js, polyfills.bundle.js.map (polyfills) 201 kB [initial] [rendered]
chunk {styles} styles.bundle.js, styles.bundle.js.map (styles) 11.5 kB [initial] [rendered]
chunk {vendor} vendor.bundle.js, vendor.bundle.js.map (vendor) 2.43 MB [initial] [rendered]
```

:rocket:

:sailboat:

:notes:

