(function(){
    var imgSources = [
            //"img/SYM1.png",
            "img/SYM3.png",
            "img/SYM4.png",
            "img/SYM5.png",
            "img/SYM6.png",
            "img/SYM7.png"
        ],
        lineImg;


    lineImg = document.createElement("img");
    lineImg.src = "img/Bet_Line.png";

    async.map(imgSources, function(src, callback){
        var img = document.createElement("img");
        img.onload = function(e){
            callback(null,img);
        };
        img.onerror = function(e){
            callback(e,null);
        };
        img.src = src;
    },init);


    function updatePoints(points){
        document.getElementById("points").innerHTML = points;
        if(points == 0){
            document.getElementById("spin").setAttribute("disabled","disabled");
        }
    }

    function init(err, imgs){
        var roulette, points;
        if(err){
            alert(err);
            return;
        }

        points = 20;
        if(location.hash == "#win"){
            imgs.pop();
            imgs.pop();
        }

        roulette = new Roulette(document.getElementsByTagName("canvas")[0],imgs,{
            lineImg:lineImg,
            onWin: function(wins){
                points += wins.length * 10;
                updatePoints(points);
            }
        });

        document.getElementById("spin").addEventListener("click",function(){
            if(!roulette.isRunning() && points > 0){
                points-=1;
                updatePoints(points);
                roulette.run();
            }
        });

    }

})();