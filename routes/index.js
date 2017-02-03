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
  GEN_ARGS1 = " -x 10 -t " + parms.trainingPath + " " //+ " -T " + parms.testPath + " "
  GEN_ARGS2 = " -T " + parms.testPath + " "
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
    // console.log(dir+"/DecisionTrees")
    fs.mkdirSync(dir+"/DecisionTrees");
    var cmd1 = "java -cp ../weka.jar weka.classifiers.trees.J48"+GEN_ARGS1+" -d "+dir+"/DecisionTrees/tmpmodel.arff"
    var cmd2 = "java -cp ../weka.jar weka.classifiers.trees.J48"+GEN_ARGS2+" -l "+dir+"/DecisionTrees/tmpmodel.arff"

    var confStart = parseFloat(parms.confStart);
    var confStep = parseFloat(parms.confStep);
    var confEnd = parseFloat(parms.confEnd);
    var out = ""

    for(i=confStart; i<=confEnd; i+=confStep){
      tempres = ""
      var tempCmd = cmd1 + " -C " + i
      console.log("---------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
      var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training Confidence "+i+" finished-------------------------------------";
      tempres+=tempOut
      console.log(tempOut)
      console.log("Executing : " +cmd2)
      tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from Confidence "+i+" finished-------------------------------------";
      console.log(tempOut)
      tempres+=tempOut
      // var first = /Correctly Classified.*([0-9]*)/.exec(tempOut);
      // var trainAcc = first[0]
      // var testAcc = /Correctly Classified.*([0-9]*)/.exec(tempOut.slice(first["index"]+1))[0];
      // trainAcc = /[0-9]+\.[0-9]+/.exec(trainAcc)[0]
      // testAcc = /[0-9]+\.[0-9]+/.exec(testAcc)[0]

      // trainCsv += i + "," + trainAcc + "\n"
      // testCsv += i + "," + testAcc + "\n"
      // console.log(first[0])
      // console.log(/Correctly Classified.*([0-9]*)/.exec(first[2]))
      fs.appendFileSync(dir+"/DecisionTrees/running_raw_output.txt", tempres)
      out += tempres
    }

    fs.outputFileSync(dir+"/DecisionTrees/raw_output.txt", out)
    // fs.outputFileSync(dir+"/DecisionTrees/train_formatted.csv", trainCsv)
    // fs.outputFileSync(dir+"/DecisionTrees/test_formatted.csv", testCsv)

  }

  if(parms.KNN){
    console.log("KNN was selected. Running Now.");
    fs.mkdirSync(dir+"/KNN");
    var cmd1 = "java -cp ../weka.jar weka.classifiers.lazy.IBk"+GEN_ARGS1+" -d "+dir+"/KNN/tmpmodel.arff"
    var cmd2 = "java -cp ../weka.jar weka.classifiers.lazy.IBk"+GEN_ARGS2+" -l "+dir+"/KNN/tmpmodel.arff"

    var knnStart = parseInt(parms.knnStart);
    var knnStep = parseInt(parms.knnStep);
    var knnEnd = parseInt(parms.knnEnd);
    var jarr = ["", "-I"]
    var out = ""

    for(i=knnStart; i<=knnEnd; i+=knnStep){
      for(j=0; j<=1; j+=1){

        tempres=""
        var tempCmd = cmd1 + " "+ jarr[j] + " " + " -K " + i
        console.log("----------------------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
        var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training neighbors,weighted "+i+","+jarr[j]+" finished-------------------------------------";
        tempres+=tempOut
        console.log(tempOut)
        console.log("Executing : " +cmd2)
        tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from neighbors,weighted "+i+","+jarr[j]+" finished-------------------------------------";
        console.log(tempOut)
        tempres+=tempOut


        fs.appendFileSync(dir+"/KNN/running_raw_output.txt", tempres)
        out += tempres
      }
    }

    fs.outputFileSync(dir+"/KNN/raw_output.txt", out)

  }

  // if(parms.SVM){
  //   console.log("SVM was selected. Running Now.");
  //   fs.mkdirSync(dir+"/SVM");
  //   var cmd1 = "java -cp ../"+GEN_ARGS1+" -d "+dir+"/SVM/tmpmodel.arff"
  //   var cmd2 = "java -cp ../weka.jar weka.classifiers.functions.LibSVM"+GEN_ARGS2+" -l "+dir+"/SVM/tmpmodel.arff"
  //
  //   var polyStart = parseInt(parms.polyStart);
  //   var polyStep = parseInt(parms.polyStep);
  //   var polyEnd = parseInt(parms.polyEnd);
  //   var rbfStart = parseFloat(parms.rbfStart);
  //   var rbfStep = parseFloat(parms.rbfStep);
  //   var rbfEnd = parseFloat(parms.rbfEnd);
  //
  //   var out = ""
  //
  //   for(i=polyStart; i<=polyEnd; i+=polyStep){
  //       tempres=""
  //       var tempCmd = cmd1 + " -K 1 -D " + i
  //       console.log("----------------------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
  //       var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training polynomial "+i+" finished-------------------------------------";
  //       tempres+=tempOut
  //       console.log(tempOut)
  //       console.log("Executing : " +cmd2)
  //       tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from polynomial "+i+" finished-------------------------------------";
  //       console.log(tempOut)
  //       tempres+=tempOut
  //
  //
  //       fs.appendFileSync(dir+"/SVM/running_raw_output.txt", tempres)
  //       out += tempres
  //   }
  //
  //   for(i=rbfStart; i<=rbfEnd; i+=rbfStep){
  //       tempres=""
  //       var tempCmd = cmd1 + " -K 2 -G " + i
  //       console.log("----------------------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
  //       var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training rbf "+i+" finished-------------------------------------";
  //       tempres+=tempOut
  //       console.log(tempOut)
  //       console.log("Executing : " +cmd2)
  //       tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from rbf "+i+" finished-------------------------------------";
  //       console.log(tempOut)
  //       tempres+=tempOut
  //
  //
  //       fs.appendFileSync(dir+"/SVM/running_raw_output.txt", tempres)
  //       out += tempres
  //   }
  //
  //   fs.outputFileSync(dir+"/SVM/raw_output.txt", out)
  //
  // }


  if(parms.Adaboost){
    console.log("Adaboost was selected. Running Now.");
    fs.mkdirSync(dir+"/Adaboost");
    var cmd1 = "java -cp ../weka.jar weka.classifiers.meta.AdaBoostM1"+GEN_ARGS1+" -d "+dir+"/Adaboost/tmpmodel.arff"
    var cmd2 = "java -cp ../weka.jar weka.classifiers.meta.AdaBoostM1"+GEN_ARGS2+" -l "+dir+"/Adaboost/tmpmodel.arff"

    var confStart = parseFloat(parms.confBoostStart);
    var confStep = parseFloat(parms.confBoostStep);
    var confEnd = parseFloat(parms.confBoostEnd);
    var iterStart = parseFloat(parms.boostIterStart);
    var iterStep = parseFloat(parms.boostIterStep);
    var iterEnd = parseFloat(parms.boostIterEnd);

    var out = ""

    for(i=confStart; i<=confEnd; i+=confStep){
      for(j=iterStart; j<=iterEnd; j+=iterStep){

        tempres=""
        var tempCmd = cmd1 + " -I "+j+" -W weka.classifiers.trees.J48 -- -M 2 -C "+i
        console.log("----------------------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
        var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training confidence,iterations "+i+","+j+" finished-------------------------------------";
        tempres+=tempOut
        console.log(tempOut)
        console.log("Executing : " +cmd2)
        tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from confidence,iterations "+i+","+j+" finished-------------------------------------";
        console.log(tempOut)
        tempres+=tempOut


        fs.appendFileSync(dir+"/Adaboost/running_raw_output.txt", tempres)
        out += tempres
      }
    }

    fs.outputFileSync(dir+"/Adaboost/raw_output.txt", out)

  }


  if(parms.NN){
    console.log("NeuralNet was selected. Running Now.");
    // console.log(dir+"/DecisionTrees")
    fs.mkdirSync(dir+"/NeuralNets");
    var cmd1 = "java -cp ../weka.jar weka.classifiers.functions.MultilayerPerceptron"+GEN_ARGS1+" -d "+dir+"/NeuralNets/tmpmodel.arff"
    var cmd2 = "java -cp ../weka.jar weka.classifiers.functions.MultilayerPerceptron"+GEN_ARGS2+" -l "+dir+"/NeuralNets/tmpmodel.arff"

    var learnStart = parseFloat(parms.learnStart);
    var learnStep = parseFloat(parms.learnStep);
    var learnEnd = parseFloat(parms.learnEnd);
    var momStart = parseFloat(parms.momStart);
    var momStep = parseFloat(parms.momStep);
    var momEnd = parseFloat(parms.momEnd);
    var epochStart = parseFloat(parms.epochStart);
    var epochStep = parseFloat(parms.epochStep);
    var epochEnd = parseFloat(parms.epochEnd);

    var out = ""

    for(i=learnStart; i<=learnEnd; i+=learnStep){
      for(j=momStart; j<=momEnd; j+=momStep){
        for(k=epochStart;k<=epochEnd;k+=epochStep){
          tempres=""
          var tempCmd = cmd1 + " -L " + i + " -M " + j + " -N " + k
          console.log("----------------------------------------------------------Executing : " + tempCmd+"--------------------------------------------------------")
          var tempOut = cp.execSync(tempCmd, {encoding: "utf-8"}) + "\n-------------------------------------Training Learn,Momentum,Epoch "+i+","+j+","+k+" finished-------------------------------------";
          tempres+=tempOut
          console.log(tempOut)
          console.log("Executing : " +cmd2)
          tempOut = cp.execSync(cmd2, {encoding: "utf-8"}) + "\n-------------------------------------Testing Model from Learn,Momentum,Epoch "+i+","+j+","+k+" finished-------------------------------------";
          console.log(tempOut)
          tempres+=tempOut


          fs.appendFileSync(dir+"/NeuralNets/running_raw_output.txt", tempres)
          out += tempres
        }
      }
    }

    fs.outputFileSync(dir+"/NeuralNets/raw_output.txt", out)

  }
  res.render('index', { title: 'Weka Runner' });
});

module.exports = router;
