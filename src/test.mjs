import { makeTxOp, makeTx, pipe } from "./core.mjs";
import {
  concat,
  constants,
  defer,
  filter,
  map,
  mergeAll,
  of,
  resolvePromises,
  returns,
  timer,
} from "./operators.mjs";
import { test } from "./test_utils.mjs";
import { delay } from "https://deno.land/std@0.121.0/async/delay.ts";

const TICK = 30;
const TWO_TICKS = 2 * TICK;

test("of", (got, expect) => {
  got(0);
  of(1, 2, 3).run(got);
  got(4);

  expect(5);
});

test("defer", (got, expect) => {
  got(0);
  const x = defer(() => {
    got(2);
    return of(3, 4, 5);
  });
  got(1);
  x.run(got);
  got(6);
  expect(7);
});

test("resolvePromises", async (got, expect) => {
  constants([1, delay(TICK).then(() => 2), Promise.resolve(3), 4], 5)
    .pipe(resolvePromises())
    .run(got, got);
  got(0);

  await delay(TWO_TICKS);

  expect(6);
});

test("mergeAll", async (got, expect) => {
  // test synchronous
  pipe(of(of(0, 1), of(2, 3)), mergeAll()).run(got);
  got(4);
  expect(5);
});

test("concat", async (got, expect) => {
  got(0);
  concat().run(
    () => got("gave a value"),
    (result) => got(result === undefined && 1),
    () => got(-1)
  );
  got(2);
  expect(3);

  concat(constants([0, 1, 2], -1), constants([3, 4], 5)).run(got, got);
  expect(6);

  concat(
    constants([0, 1]),
    constants([2, 3]),
    constants([5, 6], 7).pipe(resolvePromises()) // asynchronously completes
  ).run(got, got);
  got(4);
  await delay(0);
  expect(8);
});

test("map", async (got, expect) => {
  pipe(
    constants([0, 2], 4),
    map((num, index) => {
      got(num === 2 * index);
      return 1 + num;
    })
  ).run(got, got);

  expect(5);
});

test("filter", async (got, expect) => {
  pipe(
    constants([-1, 0, 10, -2, 0, 1], 2),
    filter((num, index) => {
      return index & 1 && num >= 0;
    })
  ).run(got, got);

  expect(3);
});

test("timer", async (got, expect) => {
  // check basics
  got(0);
  const x = timer(TICK, 3);
  await delay(TWO_TICKS);
  got(1);
  x.run(got);
  got(2);
  await delay(TWO_TICKS);
  got(4);
  expect(5);

  // check that it unsubscribes correctly
  got(0);
  const y = timer(TICK, "failed to unsubscribe");
  await delay(TWO_TICKS);
  got(1);
  const sub = y.run(got);
  got(2);
  await delay(0);
  sub.abandon();
  got(3);
  await delay(TWO_TICKS);
  expect(4);
});
