import voca from "voca";
import url from "../url";
import GitInterface from "./gitInterface"

export default class Github extends GitInterface {
  constructor(
    branchName: string,
    filePath: string,
    remoteUrl: string,
    lineNo: number
  ) {
    super(branchName, filePath, remoteUrl, lineNo);
  }

  createHistoryUrl(): string {
    return `${this.remoteUrl}commits/${this.branchName}/${this.filePath}`;
  }
  createPageUrl(): string {
    return `${this.remoteUrl}blob/${this.branchName}/${this.filePath}`;
  }
  createBlameUrl(): string {
    return `${this.remoteUrl}blame/${this.branchName}/${this.filePath}#L${this.lineNo}`;
  }
  getRelativePath(remotePath: string): { relPath: string, lineNo: number} {
    const rootPath = this.createPageUrl();
    const lineNo = parseInt(voca.substr(url.extractHashString(remotePath), 1)) || 0;
    return {
      relPath: url.makeRelativePath(url.filePath(remotePath), rootPath),
      lineNo: lineNo
    }
  }
}