import os;

class FileResolver:

  @staticmethod
  def resolve_dir_recursively(assetFileName: str, outputFileCategoryName: str):
    sourceFileNameWithoutExt, ext = assetFileName.split('.')
    sourceFilePath = os.path.join(os.getcwd(), '_assets', assetFileName)
    resultDirPath = os.path.join(os.getcwd(), '_data', sourceFileNameWithoutExt, outputFileCategoryName)

    return (sourceFilePath, resultDirPath)

  @staticmethod
  def resolve_dir_exists(outputDirPath):
    if os.path.exists(outputDirPath) == False:
      print(f"creating new directory: '{outputDirPath}'")
      os.makedirs(outputDirPath)


def parse_each_task_performance():

  a = ""
  return a