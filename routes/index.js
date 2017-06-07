var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'bytesAndBrews' });
});

router.get('/login', (req,res)=>{
	res.send('LOGIN PAGE, YO')
});

router.get('/register', (req,res)=>{
	res.send('REGISTRATION PAGE')
})

module.exports = router;
