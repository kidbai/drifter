var request = require('request');

for (var i = 1; i <= 5; i++) {
  (function(i) {
    request.post({
      url: "http://127.0.0.1:3000/throw",
      json: {"owner": "bottle" + i, "type": "male", "content": "content" + i}
    });
  })(i);
}
