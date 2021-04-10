const admin = require('firebase-admin')
const serviceAccount = process.env.FIREBASE

admin.initializeApp({
    credential: admin.credential.cert(JSON.stringify(serviceAccount))
})

module.exports = admin
