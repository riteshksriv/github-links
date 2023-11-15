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
  getRelativePath(remotePath: string): string {
    const rootPath = this.createPageUrl();
    return url.makeRelativePath(remotePath, rootPath);
  }
}