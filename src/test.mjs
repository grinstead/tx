import { makeTxOp, makeTx, pipe } from "./core.mjs";
import { defer, mergeAll, of, timer } from "./operators.mjs";

console.log("Hi");

of(1, 2, 3).open(console.log);

defer(() => {
  console.log("defer");
  return of(1, 2, 3);
}).open(console.log);

pipe(of(of("a1", "a2"), of("b1", "b2")), mergeAll()).open(console.log);

timer(1000, "hi").open(console.log);

// let gen = makeTx((output) => {
//   let running = true;
//   output.onClose = () => {
//     console.log("A closed");
//     running = false;
//   };

//   [0, 1, 2, 3, 4].every((x) => {
//     console.log(`A${x}`);
//     output.next(x);
//     return running;
//   }) && output.complete();
// });

// gen = makeTxOp((output) => (iter, index) => {
//   output.onClose = () => {
//     console.log("B closed");
//   };

//   console.log("B", iter, index);
//   output.iter(iter);

//   if (index === 2) {
//     // console.log("SEND COMPLETE");
//     output.complete();
//     // console.log("COMPLETE COMPLETE");
//     throw new Error("FAIL");
//   }
// })(gen);

// gen = makeTxOp((output) => (iter) => {
//   output.onClose = () => {
//     console.log("C closed");
//   };
//   console.log("C", iter);
//   output.iter(iter);
// })(gen);

// gen.open((val) => {
//   console.log("D", val);
// });
