import vscode from "vscode";
import url from "./url";
import _ from 'lodash'
import fs from "fs";

export default new class Editor {
  async openDocument(filePath: string, lineNumber: number): Promise<vscode.TextDocument> {
    const currentFile = this.getCurrentFile();
    if(currentFile === filePath) {
        return vscode.window.activeTextEditor!.document;
    }
    await fs.promises.access(filePath);
    return vscode.workspace.openTextDocument(filePath).then(async (doc) => {
      const editor = await vscode.window.showTextDocument(doc);
      const position = new vscode.Position(lineNumber, 0);
      editor.selection = new vscode.Selection(position, position);
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
