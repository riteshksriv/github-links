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
		doAction(createHistoryUrl).then(e => console.log("Opened history url"))
	});

	let page = vscode.commands.registerCommand('extension.github_page', () => {
		doAction(createPageUrl).then(e => console.log("Opened page url"))
	});

	let blame = vscode.commands.registerCommand('extension.github_blame', () => {
		doAction(createBlameUrl, addLineSuffix).then(e => console.log("Opened blame url"))
	});

	context.subscriptions.push(page);
	context.subscriptions.push(blame);
	context.subscriptions.push(disposable);
}

function getCurrentFile() {
	let fileName: string = _.get(vscode.window.activeTextEditor, 'document.fileName')
	return url.toForwardSlash(fileName || '')
}

function getCurrentLine() {
	let lineNo: number = _.get(vscode.window.activeTextEditor, 'selection.active.line')
	return lineNo
}

function addLineSuffix(link: string) {
	let lineno = getCurrentLine()
	return `${link}#L${lineno}`
}

async function doAction(createUrl: (a: string, b: string) => string, patchUrl: (a: string) => string = _.identity) {
	return getUrl(getCurrentFile(), createUrl)
		.then(url => {
			openUrl(patchUrl(url))
		})
		.catch(error => {
			vscode.window.showInformationMessage(`Error creating url: ${error}`)
		})
}

function createBlameUrl(remoteUrl: string, branchName: string) {
	return `${remoteUrl}blame/${branchName}`
}

function createPageUrl(remoteUrl: string, branchName: string) {
	return `${remoteUrl}blob/${branchName}`
}

function createHistoryUrl(remoteUrl: string, branchName: string) {
	return `${remoteUrl}commits/${branchName}`
}

async function getUrl(filePath: string, createUrl: (a: string, b: string) => string) {
	filePath = voca.capitalize(filePath)
	let folder = url.parentPath(filePath)
	let remoteUrl = await getBaseUrl(folder)
	const branchName = await getBranch(folder)
	let filePagePath = createUrl(remoteUrl, branchName)
	let rootFolder = url.toForwardSlash(await getRootFolder(folder))
	rootFolder = voca.capitalize(rootFolder)
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
