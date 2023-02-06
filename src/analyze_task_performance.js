const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const analyzePilotStudyResult_v2 = async () => {
  const subjectFolderId = "b4_kimura@test.com";
  const dataFolderPath = path.resolve(
    // "D:Taichi_Murakami/research/PoC_study/result-analysis/data/raw/b4_kimura@test.com"
    path.resolve("./data/raw/" + subjectFolderId)
  );
  const assetFolders = await readdir(dataFolderPath);
  console.log(assetFolders);
  const result = {};

  for (const folder of assetFolders) {
    let i = 0;
    const temp_data = {};
    const datasetsPath = path.resolve(dataFolderPath, folder);
    const files = await readdir(datasetsPath);

    for (const fileName of files) {
      const taskname = fileName.split("-")[0];
      const filepath = path.resolve(dataFolderPath, folder, fileName);
      console.log(filepath);
      const filedataRawStr = await readFile(filepath, { encoding: "utf-8" });
      const data = JSON.parse(filedataRawStr);
      console.log(data);

      temp_data[taskname] = [
        ...data.taskPerformance,
        (data.taskPerformance[1] - data.taskPerformance[0]) / 1000,
      ];
    }

    result[folder] = temp_data;
  }

  const writeFilePath = path.resolve(
    "./data/",
    `${subjectFolderId}_taskPerformance_${Date.now()}`
  );
  const writeData = JSON.stringify(result);
  writeFile(writeFilePath, writeData);
};

analyzePilotStudyResult_v2();
