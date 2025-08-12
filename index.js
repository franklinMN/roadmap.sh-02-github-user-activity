#!/usr/bin/env node
//app entry point

import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEvents, getStarred } from "./src/logic.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/package.json"), "utf8")
);

const program = new Command();
program.name("github-activity").version(pkg.version);

program
  .argument("username", "Github username")
  .description("Get recent github activity of the user")
  .action(async (username) => {
    const events = await getEvents(username);
    const starred = await getStarred(username);

    if ((events && "error" in events) || (starred && "error" in starred)) {
      // first, check whether it is null
      if (
        events.error === "Network error" ||
        starred.error === "Network error"
      ) {
        console.log(
          chalk.red("❌ Network error: Please check your internet connection")
        );
        return;
      }
      if (events.error) {
        console.log(chalk.red(`${events.error}`));
        return;
      }
      if (starred.error) {
        console.log(chalk.red(`${starred.error}`));
        return;
      }
    }

    // if (!Array.isArray(events) || !Array.isArray(starred)) {
    //   console.log(chalk.red("Unexpected response from GitHub API"));
    //   return;
    // }

    if (events.length === 0) console.log(chalk.yellow("No Events"));
    else printEvents(events);

    if (starred.length === 0) console.log(chalk.yellow("No Starred"));
    else printStarredEvents(starred);
  });

function printEvents(events) {
  let repoCreated = 0;
  let commitRepoCount = {};
  events.forEach((item) => {
    if (item.type === "CreateEvent") ++repoCreated;
    else if (item.type === "PushEvent") {
      let repoName = item.repo.name;
      commitRepoCount[repoName] = (commitRepoCount[repoName] || 0) + 1;
    }
  });

  console.log(`Created ${repoCreated} repository`);

  if (Object.keys(commitRepoCount).length > 0) {
    for (let [repo, count] of Object.entries(commitRepoCount)) {
      console.log(`Pushed ${count} commits to ${repo}`);
    }
  }
}

function printStarredEvents(starred) {
  starred.forEach((item) => {
    if (Object.hasOwn(item, "full_name"))
      console.log(`Starred ${item.full_name}`);
  });
  console.log();
}

program.parse(process.argv);
