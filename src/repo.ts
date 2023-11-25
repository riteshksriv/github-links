import simplegit from "simple-git/promise";
import branch from "git-branch";
import ClientFactory from "./clients/clientFactory";
import GitInterface from "./clients/gitInterface";
import gitRemoteOriginUrl from "git-remote-origin-url";
import voca from "voca";
import url from "./url";


export async function getAbsPathForRemote(remotePath: string, currentFolder: string) {
  const gitClient = await getClientFromRemoteURL(currentFolder);
  const rootFolder = await getRootFolder(currentFolder);
  const path = gitClient.getRelativePath(remotePath);
  return {
    fullPath: url.makeFullPath(path.relPath, rootFolder),
    lineNo: path.lineNo
  }
}

export async function getClientFromRemoteURL(currentFolder: string, lineNo: number = 0): Promise<GitInterface> {
  if (voca.isEmpty(currentFolder)) {
    throw new Error("No folder open");
  }
  const rootFolder = await getRootFolder(currentFolder);
  const baseURL = await getBaseUrl(rootFolder);
  return ClientFactory.createClient(
    await getBranch(rootFolder),
    "",
    baseURL,
    lineNo
  );
}

export async function getRootFolder(folder: string) {
  let git = simplegit(folder);
  let val = await git.revparse(["--show-toplevel"]);
  return url.appendSlash(val);
}

export async function getBranch(folder: string) {
  return branch(folder);
}

export async function getBaseUrl(folder: string) {
  let remoteURL = await getRemoteURL(folder);
  if (remoteURL.startsWith("https://")) {
    return remoteURL;
  }
  remoteURL = voca.replace(remoteURL, ":", "/");
  remoteURL = voca.replace(remoteURL, "git@", "https://");
  remoteURL = voca.substring(remoteURL, 0, remoteURL.length - 4);
  return url.appendSlash(remoteURL);
}


export async function getRemoteURL(folder: string) {
  const urlWithGit = url.toForwardSlash(await gitRemoteOriginUrl(folder));
  let remoteURL = urlWithGit.split(".git")[0];
  return url.appendSlash(remoteURL);
}
