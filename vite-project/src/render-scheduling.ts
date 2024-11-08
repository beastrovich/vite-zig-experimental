// path: @/render-scheduling.ts

export type RenderFrameFn = (
  time: DOMHighResTimeStamp,
  delta: DOMHighResTimeStamp
) => void;

enum SchedulerRunState {
  Stopped = 0,
  Stopping = 1,
  Running = 2,
}

export function scheduleRenderFrames(opts: {
  frame: RenderFrameFn;
  /**
   * The time origin for the animation.
   * If not provided, the time origin is the time provided by the browser.
   */
  renderTimeOrigin?: number;
  /**
   * If true, the animation will start immediately.
   * @default true
   */
  startImmediately?: boolean;
}) {
  const { frame, renderTimeOrigin, startImmediately = true } = opts;

  if (renderTimeOrigin !== undefined && renderTimeOrigin < 0) {
    throw new Error("Invalid render time origin");
  }

  let runState: SchedulerRunState = SchedulerRunState.Stopped;

  let renderTime = 0;
  let lastTime = 0;

  // let _frame: (time: DOMHighResTimeStamp) => void;

  const _nextFrame = (t: DOMHighResTimeStamp) => {
    const delta = t - lastTime;
    renderTime += delta;
    lastTime = t;

    frame(renderTime, delta);

    if (runState === SchedulerRunState.Running) {
      requestAnimationFrame(_nextFrame);
    } else {
      runState = SchedulerRunState.Stopped;
    }
  };

  const _firstFrame = (t: DOMHighResTimeStamp) => {
    lastTime = t;
    renderTime = renderTimeOrigin === undefined ? t : renderTimeOrigin;

    frame(renderTime, 0);

    if (runState === SchedulerRunState.Running) {
      requestAnimationFrame(_nextFrame);
    } else {
      runState = SchedulerRunState.Stopped;
    }
  };

  const stop = () => {
    if (runState === SchedulerRunState.Running) {
      runState = SchedulerRunState.Stopping;
    }
  };

  const start = () => {
    switch (runState) {
      case SchedulerRunState.Stopped:
        runState = SchedulerRunState.Running;
        requestAnimationFrame(_firstFrame);
        break;
      case SchedulerRunState.Stopping:
        runState = SchedulerRunState.Running;
        break;
      case SchedulerRunState.Running:
        break;
    }
  };

  if (startImmediately) {
    start();
  }

  return {
    start,
    stop,
  };
}
