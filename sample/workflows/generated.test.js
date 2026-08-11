const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");
const prettier = require("prettier");

// Reproduces wrap() from github-mobsuccess-policy/app/scripts/update-action.sh:
// the template is inserted between the two markers, with no blank line around them.
function generate(name, template) {
  return [
    "# DO NOT EDIT: BEGIN",
    "# This snippet has been inserted automatically by mobsuccessbot, do not edit!",
    `# If changes are needed, update the action ${name} in`,
    "# https://github.com/mobsuccess-devops/github-mobsuccess-policy",
    template.replace(/\n$/, ""),
    "# DO NOT EDIT: END",
    "",
  ].join("\n");
}

describe("generated workflows", () => {
  const dir = __dirname;
  const workflows = readdirSync(dir).filter((file) => file.endsWith(".yml"));

  test("there is at least one sample workflow", () => {
    expect(workflows.length).toBeGreaterThan(0);
  });

  test.each(workflows)(
    "%s is Prettier-formatted once the markers are added",
    (file) => {
      const name = file.replace(/\.yml$/, "");
      const template = readFileSync(join(dir, file), "utf-8");
      const generated = generate(name, template);

      // Consumer repositories lint the generated file, not the template. When
      // the two disagree, mobsuccessbot and Prettier undo each other on every
      // sync and the update pull request reopens forever.
      expect(prettier.format(generated, { parser: "yaml" })).toBe(generated);
    }
  );
});
