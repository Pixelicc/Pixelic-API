export type RequireOneObjParam<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>> }[keyof T];

export type GetterResponse<Data, Error, Cache> = { data: Data; error?: undefined; cached: Cache } | { data?: undefined; error: "Unkown" | Error; cached: Cache };
