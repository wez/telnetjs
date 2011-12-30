var telnet = require('./telnet.js');

var s = new telnet.Server(function (c) {
	console.log("connected; term=%s %dx%d",
		c.term, c.windowSize[0], c.windowSize[1]);
	console.log(c.env);

	c.on('data', function (buf) {
		console.log("data:", buf.toString('ascii'));
		c.write("you said " + buf);
	});
	c.on('negotiated', function (code, buf) {
		if (code == 24) {
			console.log("TERM=%s", c.term);
		}
		console.log("negotiated", code, buf.toString('ascii'));
	});
	c.on('resize', function (width, height) {
		console.log("window size is %d x %d", width, height);
	});
	c.on('interrupt', function () {
		console.log("INTR!");
		c.end();
	});
	c.on('wont', function (opt) {
		console.log("WONT", opt);
	});
	c.on('will', function (opt) {
		console.log("WILL", opt);
	});
	c.on('close', function () {
		console.log("END!");
	});

	c.write("Hello!> ");
});

s.listen(1337);

