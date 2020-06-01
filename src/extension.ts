// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import _ from 'lodash'
import gitRemoteOriginUrl from 'git-remote-origin-url'
import branch from 'git-branch'
import voca from 'voca'
import url from './url'
import { exec } from 'child_process'
import simplegit from 'simple-git/promise';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "github-links" is now active!');
	let disposable = vscode.commands.registerCommand('extension.github_history', () => {
		// The code you place here will be executed every time your command is executed
		let fileName: string = _.get(vscode.window.activeTextEditor, 'document.fileName')
		// Display a message box to the user
		gitHistoryUrl(url.toForwardSlash(fileName))
			.then(url => {
				openUrl(url)
			})
			.catch(error => {
				vscode.window.showInformationMessage(`Error creating url ${error}`)
			})
		return url
	});

	let page = vscode.commands.registerCommand('extension.github_page', () => {
		// The code you place here will be executed every time your command is executed
		let fileName: string = _.get(vscode.window.activeTextEditor, 'document.fileName')
		// Display a message box to the user
		getPageUrl(url.toForwardSlash(fileName))
			.then(url => {
				openUrl(url)
			})
			.catch(error => {
				vscode.window.showInformationMessage(`Error creating url ${error}`)
			})
		return url
	});

	context.subscriptions.push(page);
	context.subscriptions.push(disposable);
}

async function getPageUrl(filePath: string) {
	filePath = voca.capitalize(filePath)
	let folder = url.parentPath(filePath)
	let remoteUrl = await getBaseUrl(folder)
	const branchName = await getBranch(folder)
	let filePagePath = `${remoteUrl}blob/${branchName}`
	let rootFolder = url.toForwardSlash(await getRootFolder(folder))
	let relPath = url.makeRelativePath(filePath, url.appendSlash(rootFolder))
	return `${filePagePath}/${relPath}`
}

async function getBaseUrl(folder: string) {
	let remoteUrl = url.toForwardSlash(await gitRemoteOriginUrl(folder))
	remoteUrl = voca.replace(remoteUrl, ':', '/')
	remoteUrl = voca.replace(remoteUrl, 'git@', 'https://')
	remoteUrl = voca.substring(remoteUrl, 0, remoteUrl.length-4)
	return url.appendSlash(remoteUrl)
}

async function gitHistoryUrl(filePath: string) {
	let folder = url.parentPath(filePath)
	let remoteUrl = await getBaseUrl(folder)
	const branchName = await getBranch(folder)
	let historyPath = `${remoteUrl}commits/${branchName}`
	let rootFolder = url.toForwardSlash(await getRootFolder(folder))
	let relPath = url.makeRelativePath(filePath, url.appendSlash(rootFolder))
	return `${historyPath}/${relPath}`
}

async function getBranch(folder: string) {
	return branch(folder)
}

async function getRootFolder(folder: string) {
	let git = simplegit(folder)
	let val = git.revparse(['--show-toplevel'])
	return val
}

function openUrl(url: string) {
	exec(`start "" ${url}`, (error) => {
		if(error) {
			return vscode.window.showInformationMessage(`Could not open link ${error}`)
		}
	})
}
// this method is called when your extension is deactivated
export function deactivate() {}
