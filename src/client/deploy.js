export * from "./index.js";

const origin = process.env.OBSERVABLEHQ_ORIGIN;
const parent = window.parent; // capture to prevent reassignment

function messaged(event) {
  if (!event.isTrusted || event.origin !== origin || event.source !== parent) return;
  event.stopImmediatePropagation();
  const message = event.data;
  if (message.type === "hello") {
    postMessage({type: "hello"});
  } else if (message.type === "load_script") {
    import(message.url).then(
      () => postMessage({type: "load_script_complete", url: message.url, re: message.id}),
      (error) => postMessage({type: "load_script_error", url: message.url, error: error.message, re: message.id})
    );
  }
}

let fingerprint = `c-${Math.random().toString(36).slice(2, 8).padStart(6, "0")}`;
let nextId = 0;
function postMessage(message) {
  parent.postMessage({id: `${fingerprint}-${++nextId}`, ...message}, origin);
}

addEventListener("message", messaged);
postMessage({type: "hello"});
