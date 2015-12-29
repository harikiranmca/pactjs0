import 'colors';

export default function(name) {
  'use strict';

  function format(level, msg) {
    return '['.grey + level + ']['.grey + ('' + process.pid).grey + ']['.grey +
        name + '] '.grey + msg.white;
  }

  return {
    name,
    debug: (msg) => {
      console.log(format('debug'.yellow, msg));
    },
    info: (msg) => {
      console.log(format('info '.blue, msg));
    },
    error: (msg, err) => {

      if (typeof msg === 'string') {
        console.log(format('error'.red.bold, msg));
      } else if (msg.message && !err) {
        console.log(format('error'.red.bold, msg.message));
        err = msg;
      }

      if (err) {
        var stack = err.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
        console.error(stack);
      }
    }
  };
}
