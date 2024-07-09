import fs from "fs";
import { exec } from "child_process";
import { config } from "dotenv";

config();

// TODOS :
import { initialConfigTemplate } from "./constants";

// create config
function createConfig(body) {
  const { treeroot, url } = body;
  const initialConfig = initialConfigTemplate(treeroot, url);
}
// copy config

function copyConfig(source, destination) {
  const command = `xcopy ${source} ${destination} /E /I /Y`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error message : ", error.message);
      return;
    }
    if (stderr) {
      console.error("Stderr : ", stderr);
      return;
    }
    console.log("Stdout : ", stdout);
  });
}
