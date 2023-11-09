import AzureDevops from "./devops"
import GitInterface from "./gitInterface"
import Github from "./github"

export default class ClientFactory {
    static createClient(branchName: string, filePath: string, remoteURL: string, lineNo: number) : GitInterface {
        if (remoteURL.includes('github.com')) {
            return new Github(branchName, filePath, remoteURL, lineNo)
        }
        if (remoteURL.includes('visualstudio.com') 
            || remoteURL.includes('dev.azure.com/')) {
            return new AzureDevops(branchName, filePath, remoteURL, lineNo)
        }
        throw new Error(`Invalid Remote name: ${remoteURL}`)
    }
}