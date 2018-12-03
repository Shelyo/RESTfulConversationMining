

function generatePattern(pattern, size) {
  for (let i = 0; i < size; i++) {
    pattern[i] = {
      method: "*",
      url: "*",
      status: "*"
    }
  }
};