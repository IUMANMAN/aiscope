import { initCommand } from "./commands/init.js";
import { useCommand } from "./commands/use.js";
import { hookCommand, activateCommand, deactivateCommand } from "./commands/hook.js";
import { statusCommand } from "./commands/status.js";
import { listCommand } from "./commands/list.js";
import { editCommand } from "./commands/edit.js";
import { linkCommand } from "./commands/link.js";
import { exportCommandForScope } from "./commands/export.js";
import { setCommand, unsetCommand, varsCommand } from "./commands/vars.js";
import { addCommand, removeCommand, shareCommand, sharedCommand } from "./commands/shared.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { doctorCommand } from "./commands/doctor.js";
import { versionCommand } from "./commands/version.js";
import { helpCommand } from "./commands/help.js";

export async function run(argv = process.argv) {
  const args = argv.slice(2);
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    helpCommand();
    return;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    await versionCommand();
    return;
  }

  switch (command) {
    case "init":
      await initCommand(rest);
      break;
    case "use":
      await useCommand(rest);
      break;
    case "set":
      await setCommand(rest);
      break;
    case "unset":
      await unsetCommand(rest);
      break;
    case "vars":
      await varsCommand();
      break;
    case "dashboard":
    case "dash":
      await dashboardCommand();
      break;
    case "shared":
      await sharedCommand(rest);
      break;
    case "add":
      await addCommand(rest);
      break;
    case "remove":
      await removeCommand(rest);
      break;
    case "share":
      await shareCommand(rest);
      break;
    case "hook":
      hookCommand(rest);
      break;
    case "status":
      await statusCommand();
      break;
    case "list":
      await listCommand();
      break;
    case "edit":
      await editCommand();
      break;
    case "export":
      await exportCommandForScope();
      break;
    case "link":
      await linkCommand(rest);
      break;
    case "doctor":
      await doctorCommand();
      break;
    case "__activate":
      await activateCommand(rest);
      break;
    case "__deactivate":
      deactivateCommand();
      break;
    default:
      throw new Error(`unknown command "${command}". Run "aiscope help".`);
  }
}
