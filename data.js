var runPathIndex = 0    //第一条跑步路径
var runPath = []    //路径
var runnerImgContent  //设定canvas图片容器
var arr = []
var everyKm = []
var distance = 0
var dotCount = 0
var dotCounts = []
var jungePause = 0
var jungePauseTime = 0 //判断距离是否与disCount[jungePauseTime]
$.ajax({
	type:"get",
    url: "http://192.168.1.146/mock/data.json",
    error:function(err){
        console.log(err.status);
    },
    success:function(data){
    	console.log(data)
        runPath = data;
        var r = 250
        var gb = 250
        for(var i = 0;i<runPath.length;i++){
            var theGb = parseInt((1500/runPath[i].speed*20))
            runPath[i].color = 'rgb(250,'+theGb+','+theGb+')'
            for(var j=0;j<=runPath[i].path.length-2;j++){
                dotCount++
                distance += new AMap.LngLat(runPath[i].path[j+1][0], runPath[i].path[j+1][1]).distance(runPath[i].path[j])
                console.log(distance)
                if(distance >= 1000){
                    dotCounts.push(dotCount)
                    distance = 0
                }
            }
        }
        console.log('dotCount'+dotCount)
        console.log(dotCounts)
    }
})


var img = new Image();
img.src = 'http://192.168.1.146/mock/runner2.png';



