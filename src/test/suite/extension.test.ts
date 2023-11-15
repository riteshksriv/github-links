import * as assert from 'assert';
import { getAbsPathForRemote } from "../../repo";

describe("Extension Test Suite", () => {
  test("openFileFromRemote should open a file from a remote path", async () => {
    const remotePath =
      "https://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@github.com/riteshksriv/github-links/blob/master/src/url.ts";
    const absPath = await getAbsPathForRemote(
      remotePath,
      "C:\\repos\\projects\\github-links\\"
    );
    assert.strictEqual(
      absPath,
      "C:/repos/projects/github-links/src/url.ts"
    );
  });
});