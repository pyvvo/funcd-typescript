// src/handler.ts
var handle = (context, event) => {
  const { name, excited } = event.data;
  context.log("greeting", name);
  return { greeting: excited ? `Hello, ${name}!` : `Hello, ${name}.` };
};
export {
  handle
};
