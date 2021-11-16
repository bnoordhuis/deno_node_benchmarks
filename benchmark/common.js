'use strict';

const { spawn } = require("child_process");
const { cpus } = require("os");

module.exports = {
  PORT: 8888,
  createBenchmark,
};

function createBenchmark(fn, configs, options) {
  process.nextTick(go, fn, configs, options);
  return { http, start, end };
}

function go(fn, configs, options) {
  let rounds = permute(Object.entries(configs)).map(Object.fromEntries);

  for (const arg of process.argv.slice(2)) {
    let [k, v] = arg.split("=", 2);
    const t = Number(v);
    if (v === String(t)) v = t;
    rounds = rounds.filter(round => round[k] === v);
  }

  if (rounds.length === 1) {
    fn(rounds[0], options);
  } else {
    next(rounds);
  }
}

function next(rounds) {
  const round = rounds.shift();
  if (round === undefined) return;

  const args = Object.entries(round).map(([k, v]) => k + "=" + v);
  args.unshift(...process.argv.slice(1));

  if (globalThis.Deno) {
    args.unshift(..."run --no-check --unstable --compat -A".split(" "));
  }

  const options = { stdio: "inherit" };
  spawn(process.argv[0], args, options).on("exit", () => next(rounds));
}

function http({ path, connections, duration }, finish) {
  const url = `http://127.0.0.1:${module.exports.PORT}${path}`;

  const args = [
    "-c", String(connections),
    "-d", String(duration),
    "-t", String(Math.min(connections, cpus().length || 8)),
    url];

  const options = { stdio: ["inherit", "pipe", "inherit"] };
  const child = spawn("wrk", args, options).on("exit", exit);

  let stdout = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", data => stdout += data);

  function exit() {
    const match = stdout.match(/Requests\/sec:[ \t]+([0-9.]+)/)
    const throughput = match && +match[1];
    report(throughput);
    finish();
  }
}

function start() {
  start.time = process.hrtime.bigint();
}

start.time = undefined;

function end(operations) {
  const time = process.hrtime.bigint();
  const elapsed = time - start.time;
  const rate = operations / (Number(elapsed) / 1e9);
  report(rate);
}

function report(rate) {
  console.log(process.argv.slice(1).join(" "), rate);
}

function permute(entries, state = [], accu = []) {
  if (entries.length === 0) {
    accu.push(state);
    return accu;
  }

  let [key, values] = entries[0];
  const rest = entries.slice(1);

  if (!Array.isArray(values)) {
    values = [values];
  }

  for (const value of values) {
    permute(rest, state.concat([[key, value]]), accu);
  }

  return accu;
}
