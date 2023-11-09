import GitInterface from "./gitInterface"
import voca from 'voca'

export default class AzureDevops extends GitInterface {

    constructor(branchName: string, filePath: string, remoteUrl: string, lineNo: number) {
        super(branchName, filePath, remoteUrl, lineNo)
    }

    createHistoryUrl(): string {
        return `${voca.trimRight(this.remoteUrl, "/")}?_a=history&version=GB${encodeURIComponent(this.branchName)}&path=${this.filePath}`
    }
    createPageUrl(): string {
        return `${voca.trimRight(this.remoteUrl, "/")}?version=GB${encodeURIComponent(this.branchName)}&path=${this.filePath}`
    }
    createBlameUrl(): string {
        return `${voca.trimRight(this.remoteUrl, "/")}?_a=blame&version=GB${encodeURIComponent(this.branchName)}&path=${this.filePath}&line=${this.lineNo}`
    }
}