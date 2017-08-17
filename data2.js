var runPathIndex = 0    //第一条跑步路径
var runPath = []    //路径
var runnerImgContent  //设定canvas图片容器
var arr = []
var everyKm = []
var distance = 0
var dotCount = 0
var dotCounts = [] //每公里在点的下标的集合
var jungePause = 0
var jungePauseTime = 0 //判断距离是否与disCounts[jungePauseTime]
var json = [[109.596607,31.491171],[109.59695,31.491171],[109.597122,31.491171],[109.597465,31.491171],[109.597637,31.491171],[109.59798,31.491025],[109.598152,31.490879],[109.598324,31.490732],[109.598495,31.490732],[109.598667,31.490732],[109.598839,31.490732],[109.599182,31.490439],[109.599354,31.490293],[109.599525,31.490293],[109.599869,31.49],[109.60004,31.49],[109.600384,31.489854],[109.600898,31.489854],[109.601413,31.489854],[109.6021,31.489415],[109.602272,31.489268],[109.602443,31.489122],[109.602787,31.488829],[109.603473,31.488244],[109.604332,31.487805],[109.60519,31.487512],[109.605877,31.487365],[109.606048,31.487219],[109.606392,31.486926],[109.606735,31.48678],[109.606907,31.486633],[109.607078,31.486487],[109.60725,31.486341],[109.607593,31.486048],[109.607765,31.485901],[109.607937,31.485901],[109.60828,31.485755],[109.60828,31.485609],[109.608452,31.485609],[109.608452,31.485462],[109.608795,31.485316],[109.608967,31.48517],[109.609653,31.484584],[109.609997,31.484438],[109.610512,31.484291],[109.610512,31.484145],[109.610855,31.483998],[109.611027,31.483706],[109.611198,31.483706],[109.61137,31.483559],[109.61137,31.483413],[109.611541,31.483266],[109.611713,31.48312],[109.611885,31.482827],[109.611885,31.482681],[109.611885,31.482535],[109.612228,31.482095],[109.6124,31.481949],[109.6124,31.481803],[109.612571,31.481656],[109.612571,31.48151],[109.612571,31.481363],[109.612571,31.481217],[109.612571,31.481071],[109.612571,31.480924],[109.612571,31.480778],[109.612571,31.480631],[109.612571,31.480485],[109.612571,31.480339],[109.612571,31.480192],[109.612571,31.479899],[109.612571,31.479753],[109.612571,31.479607],[109.6124,31.47946],[109.6124,31.479314],[109.612228,31.479314],[109.612228,31.479167],[109.612056,31.479021],[109.611885,31.478875],[109.611713,31.478728],[109.611713,31.478582],[109.611541,31.478582],[109.611198,31.478435],[109.610855,31.478435],[109.61034,31.478435],[109.610168,31.478435],[109.609997,31.478435],[109.609653,31.478289],[109.60931,31.478289],[109.608795,31.478289],[109.608623,31.478289],[109.608452,31.478289],[109.608108,31.478289],[109.607765,31.478289],[109.607593,31.478289],[109.60725,31.478289],[109.607078,31.478289],[109.606735,31.478289],[109.606563,31.478289],[109.60622,31.478289],[109.606048,31.478435],[109.605877,31.478582],[109.605705,31.478582],[109.605533,31.478582],[109.605362,31.478728],[109.60519,31.478728],[109.605018,31.478875],[109.604847,31.479021],[109.604503,31.479167],[109.604503,31.479314],[109.604332,31.479314],[109.60416,31.47946],[109.603988,31.47946],[109.603817,31.479753],[109.603645,31.479753],[109.603302,31.479899],[109.602958,31.480192],[109.602787,31.480339],[109.602443,31.480485],[109.602272,31.480631],[109.6021,31.480778],[109.601757,31.481071],[109.601585,31.481217],[109.601242,31.481363],[109.601242,31.48151],[109.60107,31.48151],[109.600898,31.481803],[109.600727,31.481949],[109.600384,31.481949],[109.600212,31.482095],[109.60004,31.482095],[109.60004,31.482388],[109.599697,31.482388],[109.599354,31.482681],[109.59901,31.482827],[109.598839,31.482974],[109.598667,31.482974],[109.598495,31.482974],[109.598152,31.48312],[109.59798,31.483266],[109.597809,31.483413],[109.597637,31.483413],[109.597465,31.483559],[109.597122,31.483706],[109.59695,31.483706],[109.59695,31.483852],[109.596779,31.483998],[109.596435,31.484145],[109.596092,31.484438],[109.595577,31.48473],[109.595405,31.48473],[109.595234,31.485023],[109.595062,31.48517],[109.59489,31.48517],[109.59489,31.485316],[109.594719,31.485462],[109.594719,31.485609],[109.594375,31.485901],[109.594375,31.486048],[109.594204,31.486048],[109.594204,31.486194],[109.594204,31.486487],[109.594032,31.486487],[109.594032,31.486633],[109.59386,31.486633],[109.59386,31.48678],[109.59386,31.486926],[109.593689,31.487219],[109.593689,31.487365],[109.593517,31.487365],[109.593345,31.487512],[109.593174,31.487658],[109.593174,31.487805],[109.59283,31.488097],[109.59283,31.488244],[109.59283,31.488536],[109.59283,31.488683],[109.59283,31.488829],[109.59283,31.488976],[109.59283,31.489122],[109.59283,31.489268],[109.593002,31.489415],[109.593002,31.489561],[109.593174,31.489707],[109.593345,31.489707],[109.593689,31.489707],[109.594032,31.489854],[109.594375,31.489854],[109.594547,31.489854],[109.59489,31.489854],[109.595062,31.489707],[109.595405,31.489561],[109.595577,31.489415],[109.595749,31.489415],[109.596092,31.489122]]
var zhongjianobj = {
    "speed":"200",
    "path":""
}
var thatSpeed;
var thatGB;
    for(var i=0;i<json.length-1;i++){
        // console.log(json[i])
        // console.log('i+1:'+json[i+1])
        // console.log('i:'+json[i])
        thatSpeed = 200+i*2
        thatGB = 350 - thatSpeed/2
        zhongjianobj = {
            "speed" : thatSpeed,
            "path" : [json[i],json[i+1]],
            "color" : 'rgb(250,'+thatGB+','+thatGB+')'
        }
        runPath.push(zhongjianobj) 

        //计算距离
        dotCount++
        distance += new AMap.LngLat(json[i+1][0], json[i+1][1]).distance(json[i])
        if(distance >= 1000){
            dotCounts.push(dotCount)
            distance = 0
        }
    }
    console.log('dotCounts:'+dotCounts)
console.log(runPath[62])

var img = new Image();
var switchs = 1;
var timer = setInterval(function(){
    if(switchs >= 17){
        switchs = 1
    }
      img.src = 'http://192.168.1.146/mockSmile/images/run-'+switchs+'.png'
      switchs++
},30)

var smileImg = new Image();
smileImg.src = 'http://192.168.1.146/mockSmile/smile.png';

var flagImg = new Image();
flagImg.src = 'http://192.168.1.146/mockSmile/flag.png';

var topBar = document.createElement('div');
topBar.id = 'topBar'






