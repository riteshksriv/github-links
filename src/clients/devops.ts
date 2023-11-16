import GitInterface from "./gitInterface"
import voca from 'voca'
import url from '../url'
import _ from 'lodash'

export default class AzureDevops extends GitInterface {
  constructor(
    branchName: string,
    filePath: string,
    remoteUrl: string,
    lineNo: number
  ) {
    super(branchName, filePath, remoteUrl, lineNo);
  }

  createHistoryUrl(): string {
    return `${voca.trimRight(
      this.remoteUrl,
      "/"
    )}?_a=history&version=GB${encodeURIComponent(this.branchName)}&path=${
      this.filePath
    }`;
  }
  createPageUrl(): string {
    return `${voca.trimRight(
      this.remoteUrl,
      "/"
    )}?version=GB${encodeURIComponent(this.branchName)}&path=${this.filePath}`;
  }
  createBlameUrl(): string {
    return `${voca.trimRight(
      this.remoteUrl,
      "/"
    )}?_a=blame&version=GB${encodeURIComponent(this.branchName)}&path=${
      this.filePath
    }&line=${this.lineNo}`;
  }
  
  getRelativePath(remotePath: string): {relPath: string, lineNo: number} {
    const lineNo = parseInt(voca.substr(url.extractHashString(remotePath), 1)) || 0;
    const path = _.get(url.params(url.extractParamString(remotePath)), "path");
    return {
      relPath: voca.trimLeft(path, '/'),
      lineNo: lineNo
    }
  }
}