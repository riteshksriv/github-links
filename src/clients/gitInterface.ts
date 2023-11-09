export default abstract class GitInterface {
    readonly remoteUrl: string;
    readonly branchName: string;
    readonly filePath: string;
    readonly lineNo: number;

    constructor(branchName: string, filePath: string, remoteUrl: string, lineNo: number) {
        this.remoteUrl = remoteUrl;
        this.branchName = branchName;
        this.filePath = filePath;
        this.lineNo = lineNo;
    }
    abstract createHistoryUrl(): string;
    abstract createPageUrl() : string;
    abstract createBlameUrl() : string;
}