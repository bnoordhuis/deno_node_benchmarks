# prereqs

1. Put [`wrk`](https://github.com/wg/wrk) on your PATH.

2. Clone [`deno_std`](https://github.com/denoland/deno_std).

3. `export DENO_NODE_COMPAT_URL=file://path/to/deno_std/` (note trailing slash)

# how to

    # run all benchmarks in file
    $ deno run --no-check --unstable --compat -A benchmark/http/simple.js

    # run a subset
    $ deno run --no-check --unstable --compat -A benchmark/http/simple.js type=bytes len=1024 c=50

    # run a single benchmark
    $ deno run --no-check --unstable --compat -A benchmark/http/simple.js type=bytes len=1024 chunks=1 c=50 chunkedEnc=0 duration=5

# and then

The benchmarks work under Node so you can compare results like this:

    $ node benchmark/http/simple.js

    $ node benchmark/http/simple.js type=bytes len=1024 c=50 

    $ node benchmark/http/simple.js  type=bytes len=1024 chunks=1 c=50 chunkedEnc=0 duration=5
