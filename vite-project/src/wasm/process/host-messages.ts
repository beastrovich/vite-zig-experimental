export type ProcessHostMessageType = {
  type: "worker:start";
  globalContextPtr: number;
  instancePtr: number;
};
