const { readdir, readFile, writeFile } = require("fs/promises");
const path = require("path");
const XLSX = require("xlsx");

const getUserOperations = (data, taskid) => {
  return data.userOperations;
  // return Boolean(data?.userOperationLogs)
  //   ? //kimura-fmt
  //     data.userOperations
  //   : {
  //       //ooka-fmt
  //       mouseEvent: data.userOperationLogs.mouseEvent[taskid],
  //       wheelEvent: data.userOperationLogs.wheelEvent[taskid] ?? [],
  //     };
};

const analyzeMouseMoveEventFromResult = (data) => {
  const result = [["dx", "dy", "distance from prev point"]];
  const temp_mousemoves = data.filter((v) => v[0] === "mousemove");

  for (let i = 1; i < temp_mousemoves.length; i++) {
    const d_prev = temp_mousemoves[i - 1];
    const d_current = temp_mousemoves[i];
    const x1 = d_prev[2][0];
    const y1 = d_prev[2][1];
    const x2 = d_current[2][0];
    const y2 = d_current[2][1];
    result.push([
      Math.abs(x1 - x2),
      Math.abs(y1 - y2),
      Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2),
    ]);
  }

  return result;
};

const analyzeWheelEventFromResult = (data) => {
  const result = [["scrollX", "scrollY"]];
  const temp_wheels = data.filter((v) => v[0] === "wheel");

  for (const d of temp_wheels) {
    result.push([d[2][0], d[2][1]]);
  }

  return result;
};

const getAverageFromAnalyzedResult = (analyzedData) => {
  const sum = [];
  for (let i = 0; i < analyzedData[0].length; i++) {
    sum.push(0);
  }

  // i=0 はラベルデータなので無視
  for (let i = 1; i < analyzedData.length; i++) {
    const d = analyzedData[i];
    for (let j = 0; j < d.length; j++) {
      sum[j] += Math.abs(d[j]);
    }
  }

  const mean = [];

  for (let i = 0; i < sum.length; i++) {
    mean.push(sum[i] / (analyzedData.length - 1));
  }

  const result = [sum, mean];

  console.log(result);
  return result;
};

const analyzePointerEventAll = async (subjectFolderId) => {
  const dataFolderPath = path.resolve(
    path.resolve("./data/raw/" + subjectFolderId)
  );

  const assetFolders = await readdir(dataFolderPath);
  console.log(assetFolders);

  //create book instance
  const wb = XLSX.utils.book_new();
  const test = [];

  // start analisis per files
  for (const folder of assetFolders) {
    //parse folder path
    const datasetsPath = path.resolve(dataFolderPath, folder);
    const files = await readdir(datasetsPath);
    console.log("\n\n", folder, "");

    // prepare for workbook instance
    const writeData = {
      mousemove: {
        sheetName: `${folder}_mousemove`,
        data: [],
      },
      wheel: {
        sheetName: `${folder}_wheel`,
        data: [],
      },
    };
    for (const prop of Object.values(writeData))
      wb.SheetNames.push(prop.sheetName);

    for (const fileName of files) {
      console.log(fileName);
      if (!fileName.includes("-")) {
        continue;
      }

      const taskid = fileName.split("-")[0];
      const filepath = path.resolve(dataFolderPath, folder, fileName);
      const filedataRawStr = await readFile(filepath, { encoding: "utf-8" });
      const data = JSON.parse(filedataRawStr);

      const userOpData = getUserOperations(data, taskid);

      //mouseEvents
      const mousemoveEvents_analyzed = analyzeMouseMoveEventFromResult(
        userOpData.mouseEvent
      );
      writeData.mousemove.data = [
        ...writeData.mousemove.data,
        [], //改行
        [taskid + "_mousemove"],
        ...mousemoveEvents_analyzed,
        [],
        ...getAverageFromAnalyzedResult(mousemoveEvents_analyzed),
        [],
        [],
      ];

      //wheelEvents
      const wheelEvents_analyzed = analyzeWheelEventFromResult(
        userOpData.wheelEvent
      );
      writeData.wheel.data = [
        ...writeData.wheel.data,
        [],
        [taskid + "_wheel"],
        ...wheelEvents_analyzed,
        [],
        ...getAverageFromAnalyzedResult(wheelEvents_analyzed),
        [],
        [],
      ];
    }

    //write result to xlsx
    for (const [eventId, data] of Object.entries(writeData)) {
      console.log(folder, eventId);
      const sheetName = `${folder}_${eventId}`;
      wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data.data);

      // console.log(data.data);
      test.push(sheetName);
    }
  }

  //XLSXファイル設定&書き出し
  // console.log(test);
  // console.log(wb.SheetNames);
  const now = new Date();
  wb.Props = {
    Title: "",
    Subject: "",
    Author: "",
    CreatedDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  };
  await XLSX.writeFile(wb, `${subjectFolderId}_result.xlsx`);
};

// analyzePointerEventAll("b4_kimura@test.com");
analyzePointerEventAll("b4_ooka@test.com");

// const writeFilePath = path.resolve(
//   path.resolve(`${subjectFolderId}-${fileName}_pointerEventsSummarization`)
// );
