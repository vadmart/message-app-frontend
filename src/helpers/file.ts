 export const getFileName = (path: string | object): string => {
   if (typeof path === "object") return path.name;
    const pathArr = path.split("/");
    return decodeURIComponent(pathArr[pathArr.length - 1])
 }

 export const getFileExtension = (path: string): RegExpExecArray => {
    return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined
 }