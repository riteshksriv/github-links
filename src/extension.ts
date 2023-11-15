// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import _ from "lodash";
import voca from "voca";
import url from "./url";
import { exec } from "child_process";
import GitInterface from "./clients/gitInterface";
import ClientFactory from "./clients/clientFactory";
import editor from "./editor";
import * as repo from "./repo";

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand(
    "extension.github_history",
    () => {
      doAction((client: GitInterface) => client.createHistoryUrl()).then((e) =>
        console.log("Opened history url")
      );
    }
  );

  let page = vscode.commands.registerCommand("extension.github_page", () => {
    doAction((client: GitInterface) => client.createPageUrl()).then((e) =>
      console.log("Opened page url")
    );
  });

  let blame = vscode.commands.registerCommand("extension.github_blame", () => {
    doAction((client: GitInterface) => client.createBlameUrl()).then((e) =>
      console.log("Opened blame url")
    );
  });

  const openFile = vscode.commands.registerCommand(
    "extension.open_file",
    async () => {
      const remotePath = await vscode.env.clipboard.readText();
      await editor.openDocument(await repo.getAbsPathForRemote(remotePath, editor.getCurrentFolder()));
    }
  );

  context.subscriptions.push(openFile);
  context.subscriptions.push(page);
  context.subscriptions.push(blame);
  context.subscriptions.push(disposable);
}

async function doAction(
  createUrl: (client: GitInterface) => string,
  patchUrl: (a: string) => string = _.identity
) {
  return getUrl(editor.getCurrentFile(), createUrl)
    .then((url) => {
      openUrl(patchUrl(url));
    })
    .catch((error) => {
      vscode.window.showInformationMessage(`Error creating url: ${error}`);
    });
}

async function getUrl(
  filePath: string,
  createUrl: (client: GitInterface) => string
) {
  filePath = voca.capitalize(filePath);
  let folder = url.parentPath(filePath);
  let remoteUrl = await repo.getBaseUrl(folder);
  const branchName = await repo.getBranch(folder);
  let rootFolder = url.toForwardSlash(await repo.getRootFolder(folder));
  rootFolder = voca.capitalize(rootFolder);
  let relPath = url.makeRelativePath(filePath, url.appendSlash(rootFolder));
  const gitClient = ClientFactory.createClient(
    branchName,
    relPath,
    remoteUrl,
    editor.getCurrentLine()
  );
  return createUrl(gitClient);
}

function openUrl(url: string) {
  exec(`start "" "${url}"`, (error) => {
    if (error) {
      return vscode.window.showInformationMessage(
        `Could not open link ${error}`
      );
    }
  });
}
// this method is called when your extension is deactivated
export function deactivate() {}
