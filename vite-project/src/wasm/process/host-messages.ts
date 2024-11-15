export type ProcessHostMessageType =
  | {
      type: "worker:start";
      ptr: number;
    }
  | {
      type: "worker:closed";
    }
  | {
      type: "main:closed";
    };
