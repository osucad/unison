import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        "ignores": [
            "**/dist",
            "**/vite.config.*.timestamp*",
            "**/vitest.config.*.timestamp*"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?js$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "scope:shared",
                            onlyDependOnLibsWithTags: [
                                "scope:shared"
                            ]
                        },
                        {
                            sourceTag: "scope:server",
                            onlyDependOnLibsWithTags: [
                                "scope:server",
                                "scope:shared",
                            ]
                        },
                        {
                            sourceTag: "scope:client",
                            onlyDependOnLibsWithTags: [
                                "scope:client",
                                "scope:shared",
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
