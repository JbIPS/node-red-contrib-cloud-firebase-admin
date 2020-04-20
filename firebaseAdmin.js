const admin = require('firebase-admin');

module.exports = function (RED) {
	"use strict";

	function FirebaseAdminConfig(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		if(!node.credentials.serviceAccountKey) throw "Service account key is missing";

		let serviceAccountKey;
		try {
			serviceAccountKey = JSON.parse(node.credentials.serviceAccountKey);
		} catch (e) {
			throw "Bad service account json";
		}
		node.app = admin.initializeApp({
			credential: admin.credential.cert(serviceAccountKey),
			databaseURL: `https://${serviceAccountKey.project_id}.firebaseio.com`,
			projectId: serviceAccountKey.project_id
		}, serviceAccountKey.project_id);
		node.firebase = admin;
		node.firestore = node.app.firestore();

		node.on('close', async (done) => {
			try {
				await Promise.all(admin.apps.map(app => app.delete()));
			} catch(e) {
				console.error(e.message || e);
			} finally {
				done();
			}
		});
	}

	RED.nodes.registerType("firebase admin", FirebaseAdminConfig, {
		credentials: {
			serviceAccountKey: {type: "text"}
		}
	});
}
