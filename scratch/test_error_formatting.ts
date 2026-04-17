import { formatAuthError } from './src/utils/authErrors';

const testErrors = [
  new Error("Failed to fetch"),
  new Error("NetworkError when attempting to fetch resource."),
  new Error("Error 502 (Status: 502)"),
  "Invalid credentials",
  "Something went wrong <!doctype html>...",
  { message: "Failed to parse server response. (Status: 200)" }
];

testErrors.forEach(err => {
  console.log('---');
  console.log('Input:', err);
  console.log('Output:', formatAuthError(err));
});
