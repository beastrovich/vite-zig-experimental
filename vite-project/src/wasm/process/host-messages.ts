export type ProcessHostMessageType = {
  type: "worker:start";
  globalContextPtr: number;
  startFnPtr: number;
  dataPtr: number;
};
