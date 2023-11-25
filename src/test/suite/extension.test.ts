import * as assert from 'assert';
import simplegit from 'simple-git/promise';
import _, { get } from 'lodash';
import { getAbsPathForRemote, getRemoteURL, getRootFolder } from "../../repo";

describe("Extension Test Suite", () => {
  test("openFileFromRemote should open a file from a remote path", async () => {
    const rootFolder = await getRootFolder(".");
    const git = simplegit(rootFolder)
    const remotePath = await getRemoteURL(rootFolder);
    const fullPath = `${remotePath}blob/master/src/url.ts`;
    const absPath = await getAbsPathForRemote(fullPath, rootFolder);
    assert.strictEqual(
      absPath.fullPath,
      `${rootFolder}src/url.ts`
    );
  });
});
