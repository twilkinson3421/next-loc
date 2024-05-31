#!/usr/bin/env -S npx tsx

import inquirer from "inquirer";

inquirer
  .prompt([
    {
      type: "confirm",
      name: "use_default",
      message: "Use default config?",
      default: false,
    },
  ])
  .then(async (answers_00a) => {
    switch (answers_00a.use_default) {
      case false: {
        inquirer
          .prompt([
            {
              type: "input",
              name: "locales",
              message: "Enter supported locales separated by a space",
              default: "en-GB",
              validate(input) {
                return new Promise((resolve) => {
                  if (!input.trim().length) {
                    resolve("Enter supported locales separated by a space");
                  }

                  resolve(true);
                });
              },
            },
          ])
          .then(async (answers_00b) => {
            const localeArray = answers_00b.locales.split(" ");

            inquirer
              .prompt([
                {
                  type: "input",
                  name: "default_locale",
                  message: "Enter default locale",
                  default: localeArray[0],
                  validate(input) {
                    return new Promise((resolve) => {
                      if (!localeArray.includes(input)) {
                        resolve(
                          "Default locale must be included as a supported locale"
                        );
                      }

                      resolve(true);
                    });
                  },
                },
                {
                  type: "input",
                  name: "locale_format",
                  message:
                    "Enter locale format as a regular expression (this can be changed later)",
                  default: "/[a-z]{2}-[A-Z]{2}/",
                  validate(input) {
                    return new Promise((resolve) => {
                      try {
                        const re = new RegExp(input);
                        resolve(true);
                      } catch (error) {
                        resolve("Invalid regular expression");
                      }
                    });
                  },
                },
                {
                  type: "input",
                  name: "path_to_dictionary",
                  message: "Enter path to dictionary",
                  default: "src/locale/dictionary/{locale}/{namespace}.json",
                },
              ])
              .then(async (answers_00c) => {
                console.log({ ...answers_00a, ...answers_00b, ...answers_00c });
              });
          });
      }
      default: {
        break;
      }
    }
  });
