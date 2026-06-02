#!/usr/bin/env node

import addCommand from "./command/AddCommand.js";
import updateCommand from "./command/UpdateCommand.js";
import removeCommand from "./command/RemoveCommand.js";
import searchCommand from "./command/SearchCommand.js";
import listCommand from "./command/ListCommand.js";
import viewCommand from "./command/ViewCommand.js";
import linksCommand from "./command/LinksCommand.js";
import refsCommand from "./command/RefsCommand.js";
import backrefsCommand from "./command/BackrefsCommand.js";
import graphCommand from "./command/GraphCommand.js";

(async () => {
  const args = process.argv.slice(2);
  const [action, ...params] = args;

  try {
    switch (action) {
      case "add":
        await addCommand(params);
        break;
      case "update":
        await updateCommand(params);
        break;
      case "remove":
        await removeCommand(params);
        break;
      case "search":
        await searchCommand(params);
        break;
      case "list":
        await listCommand(params);
        break;
      case "view":
        await viewCommand(params);
        break;
      case "links":
        await linksCommand(params);
        break;
      case "refs":
        await refsCommand(params);
        break;
      case "backrefs":
        await backrefsCommand(params);
        break;
      case "graph":
        await graphCommand(params);
        break;
      default:
        console.error(`Unknown action: ${action}`);
        process.exit(1);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
