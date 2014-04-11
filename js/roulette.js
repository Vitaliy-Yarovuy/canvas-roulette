(function(){

    function generateRibbon(maxNumber, length) {
        var i, ribbon = [];
        for (i = 0; i < length; i++) {
            ribbon.push(Math.floor(Math.random() * maxNumber));
        }
        return ribbon;
    }

    var easing = {
        linear: function(current_time, start_value, end_value, total_time){
            return (end_value - start_value) * current_time / total_time  + start_value;
        },
        easeInCubic: function ( t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeInOutCubic: function ( t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    };

    function Roulette(canvas, imgs, settings) {
        this.canvas = canvas;
        this.imgs = imgs;
        this.settings = {
            cellSize:{
                width: 235,
                height:155,
                offsetX: 6,
                offsetY: 0
            },
            ribbonSize: 1000,
            onWin: function(data){

            }
        };
        this.settings = _.extend(this.settings,settings);
        this.init();
        this.draw();
    }

    Roulette.prototype.init = function () {
        this.size = {
            width: this.canvas.width,
            height: this.canvas.height
        };
        this.ribbons = [generateRibbon(this.imgs.length, this.settings.ribbonSize),
            generateRibbon(this.imgs.length, this.settings.ribbonSize),
            generateRibbon(this.imgs.length, this.settings.ribbonSize)];
        this.ribbonIndexes = [1,1,1];
        this.isRun = false;
        this.context = this.canvas.getContext("2d");
    };

    Roulette.prototype.clear = function(){
        this.context.clearRect(0, 0, this.size.width, this.size.height);
    };

    Roulette.prototype.drawRibbon = function(column, position){
        var i, y, x, cell, baseCellIndex = Math.floor(position)-1;
        x = column * (this.settings.cellSize.offsetX + this.settings.cellSize.width);
        for(i = 0; i< 6;i++ ){
            cell = this.ribbons[column][(baseCellIndex + i + this.settings.ribbonSize) % this.settings.ribbonSize];
            y = ( baseCellIndex - position  + i ) * (this.settings.cellSize.height + this.settings.cellSize.offsetY);
            this.context.drawImage(this.imgs[cell], x, y);
        }
    };

    Roulette.prototype.drawCell = function(column, row, size){
        var cell = this.ribbons[column][(this.ribbonIndexes[column] + row)%this.settings.ribbonSize],
            x = column * (this.settings.cellSize.offsetX + this.settings.cellSize.width),
            y = row * (this.settings.cellSize.height + this.settings.cellSize.offsetY);

        if(size!=1){
            x -= this.settings.cellSize.width * (size - 1)/2;
            y -= this.settings.cellSize.height * (size - 1)/2;
        }
        this.context.save();
        this.context.translate(x, y);
        this.context.scale(size, size);
        this.context.drawImage(this.imgs[cell], 0, 0);
        this.context.restore();
    };


    Roulette.prototype.getColumnCells = function(column){
       return [
           this.ribbons[column][this.ribbonIndexes[column]%this.settings.ribbonSize],
           this.ribbons[column][(this.ribbonIndexes[column]+1)%this.settings.ribbonSize],
           this.ribbons[column][(this.ribbonIndexes[column]+2)%this.settings.ribbonSize]
       ];
    };

    Roulette.prototype.draw = function(){
        var i;
        this.clear();
        for(i = 0 ;i< this.ribbonIndexes.length;i++){
            this.drawRibbon(i,this.ribbonIndexes[i]);
        }
    };

    Roulette.prototype.drawAnimate = function(cells, size){
        var i,j;
        this.clear();
        //console.log(cells);
        for(i = 0 ;i< this.ribbonIndexes.length;i++){
            for(j = 0 ;j< 3;j++){
                this.drawCell(i,j, cells.indexOf(i+"|"+j) != -1? size : 1 );
            }
        }
    };

    Roulette.prototype.drawLines = function(lines, opacity){
        var x,y;
        this.context.save();
        this.context.globalAlpha = opacity;
        x = - 3 * this.settings.cellSize.offsetX;
        if(lines.indexOf("0|0|0") != -1){
            y = this.settings.cellSize.height * 0.5;
            this.context.drawImage(this.settings.lineImg, x, y);
        }
        if(lines.indexOf("1|1|1") != -1){
            y = this.settings.cellSize.height * 1.5;
            this.context.drawImage(this.settings.lineImg, x, y);
        }
        if(lines.indexOf("2|2|2") != -1){
            y = this.settings.cellSize.height * 2.5;
            this.context.drawImage(this.settings.lineImg, x, y);
        }
        if(lines.indexOf("0|1|2") != -1){
            this.context.save();
            x = - 3 * this.settings.cellSize.offsetX - this.size.width/2;
            y = this.settings.cellSize.height * 1.5 - this.size.height/2;
            this.context.translate(this.size.width/2, this.size.height/2);
            this.context.rotate(30*Math.PI/180);
            this.context.drawImage(this.settings.lineImg, x, y);
            this.context.restore();
        }
        if(lines.indexOf("2|1|0") != -1){
            this.context.save();
            x = - 3 * this.settings.cellSize.offsetX - this.size.width/2;
            y = this.settings.cellSize.height * 1.5 - this.size.height/2;
            this.context.translate(this.size.width/2, this.size.height/2);
            this.context.rotate(-30*Math.PI/180);
            this.context.drawImage(this.settings.lineImg, x, y);
            this.context.restore();
        }
        this.context.restore();
    };

    Roulette.prototype.run = function(){
        var that = this,
            totalTime = 3000,
            diff = 40,
            subDiff = 40,
            timeStart = new Date(),
            startIndexes = this.ribbonIndexes.map(function(item){
                return item;
            }),
            finishIndexes = this.ribbonIndexes.map(function(item){
                return Math.floor(item + diff + Math.random() * subDiff );
            }),
            animation = function(){
                var i,
                    startValue,
                    finishValue,
                    curr_time = Math.min(totalTime,new Date() - timeStart);
                for(i = 0;i< startIndexes.length;i++){
                    startValue = startIndexes[i];
                    finishValue = finishIndexes[i];
                    that.ribbonIndexes[i] = easing.easeInOutCubic(curr_time,startValue,finishValue,totalTime);
                }
                that.draw();
                if(curr_time < totalTime){
                    requestAnimationFrame(animation);
                }else {
                    that.isRun = false;
                    that.finish();
                }
            };
        this.isRun = true;
        requestAnimationFrame(animation);
    };

    Roulette.prototype.finish = function(){
        var that = this,
            wins = [],
            cells = [],
            lines = [],
            table = [
                this.getColumnCells(0),
                this.getColumnCells(1),
                this.getColumnCells(2)
            ];

        if(table[0][0] == table[1][0] && table[1][0] == table[2][0]){
            wins.push(table[0][0]);
            lines.push("0|0|0");
            cells = cells.concat(["0|0","1|0","2|0"]);
        }

        if(table[0][1] == table[1][1] && table[1][1] == table[2][1]){
            wins.push(table[0][1]);
            lines.push("1|1|1");
            cells = cells.concat(["0|1","1|1","2|1"]);
        }

        if(table[0][2] == table[1][2] && table[1][2] == table[2][2]){
            wins.push(table[0][2]);
            lines.push("2|2|2");
            cells = cells.concat(["0|2","1|2","2|2"]);
        }

        if(table[0][0] == table[1][1] && table[1][1] == table[2][2]){
            wins.push(table[0][0]);
            lines.push("0|1|2");
            cells = cells.concat(["0|0","1|1","2|2"]);
        }

        if(table[0][2] == table[1][1] && table[1][1] == table[2][0]){
            wins.push(table[0][2]);
            lines.push("2|1|0");
            cells = cells.concat(["0|2","1|1","2|0"]);
        }

        if(wins.length){
            this.isRun = true;
            setTimeout(function(){
                that.animateWins(lines, cells);
                that.settings.onWin(wins);
            },500);

        }
    };

    Roulette.prototype.animateWins = function(lines, cells){
        var that = this,
            totalTime = 2000,
            startSize = 0,
            finishSize = 0.3,
            startOpacity = 0,
            finishOpacity = 0.8,
            timeStart = new Date(),
            animation = function(){
                var curr_time = Math.min(totalTime,new Date() - timeStart),
                    size, opacity;

                if(curr_time <= totalTime/2){
                    size = easing.easeInOutCubic(curr_time,startSize,finishSize,totalTime/2);
                } else {
                    size = finishSize - easing.easeInOutCubic(curr_time-totalTime/2,startSize,finishSize,totalTime/2);
                }
                if(curr_time <= totalTime/3){
                    opacity = easing.easeInOutCubic(curr_time,startOpacity,finishOpacity,totalTime/3);
                } else if(curr_time <= totalTime*2/3){
                    opacity = finishOpacity - easing.easeInOutCubic(curr_time-totalTime/3,startOpacity,finishOpacity,totalTime/3);
                } else {
                    opacity = easing.easeInOutCubic(curr_time-totalTime*2/3,startOpacity,finishOpacity,totalTime/3);
                }

                that.drawAnimate(cells,1 + size);
                that.drawLines(lines,opacity+0.2);

                if(curr_time < totalTime){
                    requestAnimationFrame(animation);
                }else {
                    that.isRun = false;
                }
            };
        this.isRun = true;
        requestAnimationFrame(animation);
    };


    Roulette.prototype.isRunning = function(){
        return this.isRun;
    };

    window.Roulette = Roulette;
})();