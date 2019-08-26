/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2018 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/
import urlLib from 'url';
import string from 'voca'
import _ from 'lodash';

var globalObject = {location: ''}

interface Dictionary<T> {
  [index: string]: T;
}

export type StringMap = Dictionary<string>
export default class URL {
  static params(query: string) {
    return URL.parseParams(query);
  }
  static parseParams(params: string) {
    return _.transform(_.map(params && params.split('&'), pair => pair.split('=')), (obj: StringMap, pair: string[]) => {
      obj[pair[0]] = pair[1] && URL.decodeURI(pair[1])
    }, {});
  }
  static decodeURI(url: string): string{
    try{
      let ret = decodeURIComponent(url)
      return ret
    }
    catch(e){
      return ''
    }
  }
  static createUrl(opts: StringMap): string {
    let baseUrl = opts.baseUrl
    if (!_.isEmpty(opts.params)) {
      let paramsString = _.isString(opts.params) ? opts.params : URL.mapToEncodedString(opts.params)
      baseUrl = `${baseUrl}?${paramsString}`
    }
    if (!_.isEmpty(opts.hash)) {
      let hashString = _.isString(opts.hash) ? opts.hash : URL.mapToEncodedString(opts.hash)
      baseUrl = `${baseUrl}#${hashString}`
    }
    return baseUrl
  }
  static updateUrlParams(url: string, params:string): string{
    let hash = URL.extractHashString(url)
    params = _.extend(URL.parseParams(URL.extractParamString(url)), params)
    return URL.createUrl({ baseUrl: URL.filePath(url), hash: hash, params: params })
  }
  static updateUrlHash(url: string, hash:string): string {
    let params = URL.extractParamString(url)
    hash = _.extend(URL.parseParams(URL.extractHashString(url)), hash)
    return URL.createUrl({ baseUrl: URL.filePath(url), hash: hash, params: params })
  }
  static scheme(url: string): string {
    url = url || ''
    let index, scheme = '', firstChar = _.first(url)
    index = url.indexOf(':')
    if (firstChar !== '.' && firstChar !== '/' && firstChar !== '#' && index !== -1) {
      scheme = url.substring(0, index + 1).toLowerCase().trim()
    }
    return scheme+""
  }
  static protocol(url: string): string {
    const urlData = url ? urlLib.parse(url) : {protocol: ''}
    return (url && !URL.hasWindowsDrive(url)) ? urlData.protocol || '' : ''
  }
  static hasWindowsDrive(url: string):boolean {
    let drive = string.matches(url, /^([a-zA-Z]+):\//),
      protocol = string.matches(url, /^([a-zA-Z]+):\/\//)
    return drive && !protocol
  }
  static host(url: string): string | undefined{
    url = url || ''
    let scheme = URL.scheme(url)
    return _.first(_.compact(_.split(url.substr(scheme.length), '/')))
  }
  static hostName(url: string): string | undefined {
    return _.first(_.split(URL.host(url) || '', ':'))
  }
  static hasHttpProtocol(url: string): boolean{
    let protocol = URL.protocol(url)
    return protocol === 'http:' || protocol === 'https:'
  }
  static hasFtpProtocol(url: string): boolean{
    let protocol = URL.protocol(url)
    return protocol === 'ftp:'
  }
  static hasFileProtocol(url: string): boolean{
    return URL.protocol(url) === 'file:'
  }
  static hasRhpjProtocol(url: string): boolean{
    return URL.protocol(url) === 'rhpj:'
  }
  static stripRhpjProtocol(url: string): string{
    return URL.hasRhpjProtocol(url) ? url.substring('rhpj:'.length) : url
  }
  static stripProtocol(url: string): string {
    let protocol = URL.protocol(url)
    return url && url.substring(protocol.length + 2)
  }
  static isRemoteUrl(url: string): boolean{
    return URL.hasHttpProtocol(url) || URL.hasFtpProtocol(url)
  }
  static assureOrigin(url: string): string{
    if (url && !URL.isRelativeUrl(url) && !URL.scheme(url)) {
      return `${globalObject.location }${url}`
    }
    return url
  }
  static removeOrigin(url: string): string{
    if (!URL.isRelativeUrl(url)) {
      url = `/${URL.makeRelativeUrl(url, `/`)}`
    }
    return url
  }
  static isRelativeUrl(url: string): boolean{
    return !!( (url === '') || url && !URL.scheme(url) && string.indexOf(string.trim(url), '/') !== 0)
  }
  static filePath(url: string): string {
    let index;
    url = url || ''
    index = url.indexOf('?')
    if (index !== -1) {
      url = url.substring(0, index)
    }
    index = url.indexOf('#')
    if (index !== -1) {
      url = url.substring(0, index)
    }
    return url
  }
  static sanitize(webURL: string): string {
    return string.replaceAll(webURL, ' ', '_')
  }
  static fileName(url: string): string {
    url = url || ''
    let index = string.lastIndexOf(url, "/")
    if (index !== -1 && index === (url.length - 1)) {
      return URL.fileName(url.substr(0, index))
    }
    return index !== -1 ? string.substr(url, index + 1) : url
  }
  static Length(url: string) {
    url = url || ''
    return url.length
  }
  static fileNameWithoutExt(url: string): string{
    let fileName = URL.fileName(url)
    let extIdx = string.indexOf(fileName, '.')
    return string.substring(fileName, 0, extIdx === -1 ? URL.Length(fileName) : extIdx)
  }
  static fileNameNoExt(url: string): string{
    return URL.fileNameWithoutExt(url)
  }
  static extractStringBetween(str: string, startChar: string, endChar: string) {
    str = str || ''
    let substring, start = string.indexOf(str, startChar)
    if (start !== -1) {
      let end = str.indexOf(endChar)
      if (end < start) {
        end = str.length
      }
      substring = str.substring(start + 1, end)
    }
    return substring || ''
  }
  static extractAfterFile(url: string): string {
    return string.substring(url, URL.Length(URL.filePath(url)))
  }
  static extractHashString(url: string): string {
    return this.extractStringBetween(url, '#', '?')
  }
  static extractParamString(url: string): string {
    return this.extractStringBetween(url, '?', '#')
  }
  static isSameOrigin(srcUrl: string, baseUrl: string = ''): boolean {
    if (!URL.protocol(srcUrl) && !URL.protocol(baseUrl)) {
      return true
    }
    srcUrl = URL.assureOrigin(srcUrl)
    baseUrl = URL.assureOrigin(baseUrl)
    let baseOrigin = baseUrl ? _.slice(string.split(baseUrl, '/'), 0, 3).join('/') : ''
    return string.search(srcUrl, baseOrigin) === 0
  }
  static hasBaseUrl(srcUrl: string, baseUrl: string):boolean {
    return !!(srcUrl && (srcUrl.startsWith(baseUrl)))
  }
  static isInternal(relUrl: string, baseUrl: string): boolean{
    let absUrl = URL.makeFullPath(relUrl, baseUrl)
    return URL.isSameOrigin(absUrl, baseUrl)
  }
  static makeRelativeUrl(srcUrl: string, baseUrl: string): string{
    if (srcUrl === baseUrl) {
      return ''
    }
    if (!srcUrl || !baseUrl) {
      return srcUrl
    }
    let absPath = URL.filePath(srcUrl)
    let relPath = URL.makeRelativePath(absPath, URL.filePath(baseUrl))
    return `${relPath}${string.substring(srcUrl, absPath.length)}`
  }
  static makeRelativeFolder(srcFolder: string, baseFile: string): string{
    let relPath = URL.makeRelativePath(srcFolder, baseFile)
    return relPath ? URL.removeSlash(relPath) : '.'
  }
  static commonPrefixIdx(str1: string, str2: string) {
    let minLength = _.min([str1.length, str2.length]) || 0
    let matchLength = _.findIndex(_.range(minLength), idx => string.charAt(str1, idx) !== string.charAt(str2, idx))
    return matchLength === -1 ? minLength - 1 : matchLength - 1
  }
  static commonPrefix(str1: string, str2: string) {
    return string.substring(str1, 0, this.commonPrefixIdx(str1, str2) + 1)
  }
  static makeRelativePath(srcUrl: string, baseUrl: string): string {
    srcUrl = URL.assureOrigin(srcUrl)
    baseUrl = URL.assureOrigin(baseUrl)
    if (!srcUrl || URL.isRelativeUrl(srcUrl) || URL.isRelativeUrl(baseUrl) || !URL.isSameOrigin(srcUrl, baseUrl)) {
      return srcUrl
    }

    let commonPrefix = this.commonPrefix(srcUrl, baseUrl), commonParts = commonPrefix.split('/'),
      srcParts: string[] = string.split(srcUrl, '/'), baseParts = string.split(baseUrl, '/'),
      relParts = _.map(_.range(baseParts.length - commonParts.length), () => '..'),
      suffixParts = _.slice(srcParts, commonParts.length - 1)

    relParts = relParts.concat(suffixParts)
    if(relParts.length === 1) {
      let relUrl = _.first(relParts) || '',
        relPath = URL.filePath(relUrl)
      return relPath === relUrl || relPath !== _.last(commonParts) ? relUrl : relUrl.substring(relPath.length)
    }
    return relParts.join('/')
  }
  static makeFullPath(relUrl: string, baseUrl: string): string{
    if (!URL.isRelativeUrl(relUrl) || URL.isRelativeUrl(baseUrl)) {
      return relUrl
    }
    let baseParts = URL.filePath(baseUrl).split('/'),
      relPath = URL.filePath(relUrl),
      params = relUrl && relUrl.substring(relPath.length),
      relParts = string.split(relPath, '/')

    if (relParts.length > 1 || relParts[0]) {
      baseParts.pop()
      _.each(relParts, relPart => {
        if (relPart === '..') {
          baseParts.pop()
        } else if (relPart !== '.') {
          baseParts.push(relPart)
        }
      })
    }

    return `${baseParts.join('/')}${params}`
  }
  static makeRelativePathFromFolder(relUrl: string, baseFolder: string): string{
    return URL.makeRelativePath(relUrl, URL.appendSlash(baseFolder))
  }
  static makePathFromFolder(relUrl: string, baseFolder: string): string {
    return URL.makeFullPath(relUrl, URL.appendSlash(baseFolder))
  }
  static makePath(baseFolder: string, appendPath: string): string {
    if (!baseFolder) {
      return appendPath
    }
    if (_.first(appendPath) === '/') {
      appendPath = string.substring(appendPath, 1)
    }
    if (_.last(baseFolder) === '/') {
      return `${baseFolder}${appendPath}`
    }
    return `${baseFolder}/${appendPath}`
  }
  static mapToEncodedString(map: StringMap, explodeKey = '&', mapKey = '='): string {
    return _.reduce(map, (result, value, key) => {
      if (!_.isUndefined(value)) {
        if (result.length > 0) {
          result += explodeKey
        }
        result += `${key}${mapKey}${encodeURIComponent(value)}`
      }
      return result
    }, '')
  }
  static ext(filePath: string): string {
    if (filePath) {
      let idx = string.lastIndexOf(filePath, '.')
      if (idx !== -1) {
        return string.substring(filePath, idx + 1)
      }
    }
    return ''
  }

  static appendBookmark(file: string, bookmark: string): string {
    if (bookmark) {
      let bookmarkTag = URL.extractHashString(bookmark)
      file = bookmarkTag !== "" ? `${file}#${bookmarkTag}` : file
    }
    return file
  }
  static isSameExt(file1: string, file2: string): boolean {
    return URL.ext(file1) === URL.ext(file2)
  }
  static removeExtension(filePath: string): string {
    if (filePath) {
      let idx = string.lastIndexOf(filePath, '.')
      let fileNoExt = filePath
      if (idx !== -1) {
        fileNoExt = string.substring(filePath, 0, idx)
      }
      return fileNoExt
    }
    return filePath || ''
  }
  static removeFirstChar(text:string, char?: string) {
    if(char !== undefined) {
      text = (text && text.substring(0, 1)) === char ? text.substring(1) : text
      return text
    }
    return text && text.substring(1) || ''
  }
  static changeExt(filePath: string, ext: string): string {
    if (filePath && ext) {
      ext = this.removeFirstChar(ext, '.')
      let idx = string.lastIndexOf(filePath, '.')
      let fileNoExt = filePath
      if (idx !== -1) {
        fileNoExt = string.substring(filePath, 0, idx)
      }
      return ext ? `${fileNoExt}.${ext}` : fileNoExt
    }
    return filePath || ''
  }
  static changeName(filePath: string, newName: string): string{
    let path = URL.parentPath(filePath)
    return `${URL.appendSlash(path)}${newName}`
  }
  static changeNameNoExt(filePath: string, newName: string): string {
    let path = URL.parentPath(filePath)
    return URL.changeExt(`${URL.appendSlash(path)}${newName}`, URL.ext(filePath))
  }
  static parentName(filePath: string): string {
    let parent = URL.parentPath(filePath)
    return URL.fileName(parent)
  }
  static isAncestor(path: string, ancestor: string): boolean{
    return _.startsWith(path, ancestor)
  }
  static isSubDirectory(parent: string, child: string): boolean{
    return !URL.makeRelativePath(child, parent).startsWith('..')
  }
  static changeAncestor(filePath: string, oldFilePath: string, newFilePath: string): string {
    filePath = filePath || ''
    return filePath.replace(oldFilePath, newFilePath)
  }
  static parentPath(filePath: string = URL.filePath('')): string {
    let length = filePath ? 0 : filePath.length,
      index = string.lastIndexOf(filePath, '/')
    if (index === -1) {
      return ''
    }
    if (index !== -1) {
      filePath = string.substring(filePath, 0, index)
      if (index === length - 1) {
        filePath = URL.parentPath(filePath)
      }
    }
    return filePath
  }
  static ancestors(filePath: string): string[]{
    let ancs:string[] = []
    while (filePath = URL.parentPath(filePath)) {
      ancs.push(filePath)
    }
    return ancs
  }
  static nearestFolder(path: string): string{
    return string.endsWith(path, '/') ? path : URL.parentPath(path)
  }
  static isAbsoluteUrl(url: string): boolean {
    return !URL.isRelativeUrl(url)
  }
  static isFilePath(path: string): boolean{
    path = URL.filePath(path)
    let fileName = path && URL.fileName(path)
    return !!(fileName && fileName !== '.' && fileName.indexOf('.') !== -1)
  }
  static isFolder(path: string): boolean{
    return !!(path && !URL.isFilePath(path))
  }
  static toWindowsBashPath(path: string): string{
    path = path && URL.toForwardSlash(path)
    path = path && path.replace(/^[A-Z]:/, (matched) => matched && '/' + matched.toLowerCase().slice(0, 1))
    return path && path.replace(/ /g, '\\ ')
  }
  static toForwardSlash(path: string): string {
    if(_.isArray(path)) {
      return <any>_.map(path, item => URL._toFwdSlash(item))
    }
    return URL._toFwdSlash(path)
  }
  static _toFwdSlash(path: string): string {
    return path && _.replace(path, /\\/g, '/')
  }
  static toBackSlash(path: string): string {
    return path && _.replace(path, /\//g, '\\')
  }
  static toDoubleBackSlash(path: string): string {
    return path && _.replace(path, /\//g, '\\\\')
  }
  static equalNoCase(text1: string, text2: string) {
    // Depercate API, use localeCompare
    return string.lowerCase(text1) === string.lowerCase(text2)
  }
  static appendSlash(path: string): string {
    return (path && path.lastIndexOf('/') !== path.length - 1
      && path + '/') || path
  }
  static prependSlash(path: string): string{
    if (path && !_.isEmpty(path) && !path.startsWith('/')){
      return '/' + path
    }
    return path
  }
  static appendPath(path1: string, path2: string): string{
    path1 = URL.appendSlash(path1)
    path2 = path2 && (path2.length > 0 ) &&
              path2[0] === '/' &&
              path2.substring(1) || path2
    return  (path2 && path2.length >0) ? `${path1}${path2}` : path1
  }
  static appendPaths(path1: string, ...paths: string[]): string{
    let path = path1
    _.each(paths, path2 => {
      path = URL.appendPath(path, path2)
    })
    return path
  }
  static removeSlash(path: string): string {
    return (path && path.lastIndexOf('/') === path.length - 1
      && path.substring(0, path.length-1)) || path
  }
  static decodedPath(url: string): string {
    return url && URL.stripParam(URL.stripBookmark(URL.decodeURI(url)))
  }
  static stripStringBetween(str: string, startChar: string, endChar: string): string {
    let newStr = str
    const start = _.indexOf(str, startChar)
    if (start !== -1) {
      let end = _.indexOf(str, endChar)
      if (end < start) { end = str.length }
      newStr = `${string.substring(str, 0, start)}${string.substring(str, end, str.length)}`
    }
    return newStr
  }

  static stripParam(url: string): string {
    return url && URL.stripStringBetween(url, '?', '#')
  }

  static stripBookmark(url: string): string{
    return url && URL.stripStringBetween(url, '#', '?')
  }
  static getBookmark(url: string):string {
    return URL.extractHashString(url)
  }
  static fileNameToTitle(filePath: string): string{
    let fileNameNoExt = URL.fileNameNoExt(filePath)
    fileNameNoExt = fileNameNoExt.replace(/_/g, ' ')
    return string.capitalize(fileNameNoExt)
  }
}
