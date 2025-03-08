import path from "path";
import pm2 from "pm2";

pm2.connect((err) => {
	if (err) {
		console.error(err);
		process.exit(2);
	}

	pm2.start(
		{
			script: "dist/server.js",
			name: "spatula",
			autorestart: true,
			watch: [path.join(process.cwd(), "services", "spatula", "dist", "server.js")],
		},
		function (err, apps) {
			pm2.disconnect();
			if (err) throw err;
		}
	);
});
