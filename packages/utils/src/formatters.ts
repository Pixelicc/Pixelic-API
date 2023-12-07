import { RequireOneObjParam } from "@pixelic/types";

export const formatUUID = (UUID: string) => UUID.replace(/-/g, "").toLowerCase();

export const dashUUID = (UUID: string) => UUID.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");

export const formatNumber = (number: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "qa" },
    { value: 1e18, symbol: "qi" },
  ];
  const rx = /.0+$|(.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find((item) => {
      return number >= item.value;
    });
  return item ? (number / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

export const formatBytes = (bytes: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "B" },
    { value: 1e3, symbol: "KB" },
    { value: 1e6, symbol: "MB" },
    { value: 1e9, symbol: "GB" },
    { value: 1e12, symbol: "TB" },
  ];
  const rx = /.0+$|(.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find((item) => {
      return bytes >= item.value;
    });
  return item ? (bytes / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

export const formatTimeseries = (array: any[], options?: RequireOneObjParam<{ meta?: string; data?: string }>) => {
  const formattedArray: {}[] = [];
  for (const datapoint of array) {
    var formattedData;
    if (options?.data) {
      formattedData = {
        timestamp: Math.floor(new Date(datapoint.timestamp).valueOf() / 1000),
        [options.data]: datapoint.data,
      };
    } else {
      formattedData = {
        timestamp: Math.floor(new Date(datapoint.timestamp).valueOf() / 1000),
        ...datapoint.data,
      };
    }
    if (options?.meta) formattedData[options.meta] = datapoint.meta;
    formattedArray.push(formattedData);
  }
  return formattedArray;
};

/**
 * Converts all string values of the given object into number values
 */
export const objectStringToNumber = (obj: any) => Object.keys(obj).reduce((acc: any, key: string) => ((acc[key] = parseFloat(obj[key])), acc), {});
