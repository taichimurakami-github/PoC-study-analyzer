const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const convertResultData = (data, taskid) => {
  try {
    console.log(taskid);
    // console.log(data);

    const result = {
      ...data,
    };

    result.taskPerformance = [
      result.taskPerformance[taskid][1],
      result.taskPerformance[taskid][2],
      result.taskPerformance[taskid][2] - result.taskPerformance[taskid][1],
    ];

    result.userOperations = {
      mouseEvent: result.userOperationLogs.mouseEvent
        ? result.userOperationLogs.mouseEvent[taskid]
        : [],
      wheelEvent: result.userOperationLogs.wheelEvent
        ? result.userOperationLogs.wheelEvent[taskid]
        : [],
    };

    result.taskMetaData = {
      id: taskid,
      title: "",
      description: "",
      type: "",
    };

    delete result.userOperationLogs;

    // console.log(result);
    return result;
  } catch (e) {
    console.log(e);
    console.log("taskId:", taskid);
    console.log(data);
  }
};

const convertOokaFmtToKimuraFmt = async () => {
  const subjectFolderId = "b4_ooka@test.com";
  const dataFolderPath = path.resolve(
    path.resolve("./data/raw/" + subjectFolderId)
  );
  const outputDataFolderPath = path.resolve(
    path.resolve("./data/raw/" + subjectFolderId)
  );
  const assetFolders = await readdir(dataFolderPath);
  console.log(assetFolders);

  for (const assetFolder of assetFolders) {
    const datasetsPath = path.resolve(dataFolderPath, assetFolder);
    const files = await readdir(datasetsPath);

    for (const fileName of files) {
      const taskid = fileName.split("-")[0];
      console.log(taskid, fileName);
      const filepath = path.resolve(dataFolderPath, assetFolder, fileName);
      const filedataRawStr = await readFile(filepath, { encoding: "utf-8" });
      const data = JSON.parse(filedataRawStr);

      const newData = convertResultData(data, taskid);

      const writeFilePath = path.resolve(
        outputDataFolderPath,
        assetFolder,
        fileName
      );
      console.log(newData);
      const writeData = JSON.stringify(newData);
      writeFile(writeFilePath, writeData);
    }
  }
};

convertOokaFmtToKimuraFmt();
