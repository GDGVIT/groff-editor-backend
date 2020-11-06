const express = require('express');

const router = express.Router();

HEROKU_CRED = process.env.HEROKU_CRED

router.get('/auth2check', (req, res) => {
    var val = {
        hc: HEROKU_CRED, 
        user_id: "generalID", 
        fileName: "authTest.txt", 
        data: 'auth2 is up and working'
    }
    res.send(val);
})


module.exports = router;
