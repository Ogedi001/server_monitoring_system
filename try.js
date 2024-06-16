// Create a variable and call the process.hrtime() function.
const start_time = process.hrtime();

// Print the Start time:
console.log("Start Time:", start_time);

// Make the add function
setTimeout(function () {
  // Create two variable
  const a = "40",
    b = "50";

  // Print the Addition result:
  console.log("Add of two number is :", a - 0 + (b - 0));

  // Create a variable and call the second process.hrtime()
  // function and pass the start time as parameter.
  let end_time = process.hrtime(start_time);
  // Print the Execution time.
  console.log("End Time:", end_time);
}, 1000);

const os = require("os");
const cpus = os.cpus();
console.log(cpus.length);
console.log(cpus);
