import vscode from "vscode";
import url from "./url";
import _ from 'lodash'

export default new class Editor {
  async openDocument(filePath: string): Promise<vscode.TextDocument> {
    const currentFile = this.getCurrentFile();
    if(currentFile === filePath) {
        return vscode.window.activeTextEditor!.document;
    }
    return vscode.workspace.openTextDocument(filePath).then(async (doc) => {
      const editor = await vscode.window.showTextDocument(doc);
        return editor.document;
    });
  }

  getCurrentFile(): string {
    let fileName: string = _.get(
      vscode.window.activeTextEditor,
      "document.fileName"
    );
    return url.toForwardSlash(fileName || "");
  }

  getCurrentLine(): number {
	let lineNo: number = _.get(vscode.window.activeTextEditor, 'selection.active.line')
	return lineNo
  }

  getCurrentFolder(): string {
    const currentFolder = _.first(vscode.workspace.workspaceFolders)
    return currentFolder?.uri.fsPath || ""
  }
}
