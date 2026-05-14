import { spawn } from "node:child_process";
import { currentScope } from "../core/scope.js";

export async function editCommand() {
  const scope = await currentScope();
  if (!scope) {
    throw new Error("missing .aiscope.toml. Run aiscope init project <name> or aiscope init skill <name> first.");
  }

  const editor = process.env.EDITOR || "nano";
  await new Promise((resolve, reject) => {
    const child = spawn(editor, [scope.envPath], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${editor} exited with code ${code}`));
    });
  });
}
