var express = require('express');
var router = express.Router();

var cp = require('child_process')
var fs = require('fs-extra');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Weka Runner' });
});

/* POST home page. */
router.post('/', function(req, res, next) {
  parms = req.body
  //Always 10 fold cross validation
  GEN_ARGS = " -x 10 -t " + parms.trainingPath + " -T " + parms.testPath + " "
  console.log(parms)

  if (!fs.existsSync("experiments")){
      fs.mkdirSync("experiments");
  }
  var dir = "experiments/"+parms.expName;
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  } else {
    fs.removeSync(dir);
    fs.mkdirSync(dir);
  }

  if(parms.DecisionTree){
    console.log("Decision tree was selected. Running Now.");
    fs.mkdir(dir+"/DecisionTrees");
    // console.log(cp.execSync("pwd", {encoding: "utf-8"}))
    var cmd = "java -cp ../weka.jar weka.classifiers.trees.J48"+GEN_ARGS
    // console.log(cmd)
    // var ret = cp.execSync(cmd, {encoding: "utf-8"});
    // console.log(ret)

    var confStart = parseFloat(parms.confStart);
    var confStep = parseFloat(parms.confStep);
    var confEnd = parseFloat(parms.confEnd);
    for(i=confStart; i<=confEnd; i+=confStep){
      var tempCmd = cmd + " -C " + i
      console.log("Executing : " + tempCmd)
      var ret = cp.execSync(tempCmd, {encoding: "utf-8"});
      console.log(ret)
      console.log("--------------------------------------------------------------------------")
    }

  }
  res.render('index', { title: 'Weka Runner' });
});

module.exports = router;
