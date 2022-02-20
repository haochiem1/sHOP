window.addEventListener('load', function(){
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let obstacles = [];
    let coin;
    let gameOver = false;
    let gameWon = false;
    let score = 0; 
    let scoreCounter = 0;

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('bgImg');
            this.image2 = document.getElementById('bgImg2');
            this.image3 = document.getElementById('bgImg3');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 6;
        }
        drawCity(context)
        {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image2, this.x, this.y, this.width, this.height);
            context.drawImage(this.image3, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
            context.drawImage(this.image2, this.x + this.width, this.y, this.width, this.height);
            context.drawImage(this.image3, this.x + this.width, this.y, this.width, this.height);
        }
        scroll()
        {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.image = document.getElementById('playerImg')
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;
            this.width = 200;
            this.height = 200;
            this.x = 10;
            this.y = this.gameHeight - this.height;
            this.yVelocity = 0;
            this.weight = 1;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
        }
        refresh(input, obstacles){
            obstacles.forEach(obstacle => {
                const dx = obstacle.x - this.x; // x distance between obstacle and dog
                const dy = obstacle.y - this.y; // y distance between obstacle and dog
                const distance = Math.sqrt(dx * dx + dy * dy); // distance between obstacle and dog
                if (distance < obstacle.width/3 + this.width/3){ 
                    gameOver = true;
                }
            })

            if(input.keys.indexOf('ArrowUp') > -1 && this.grounded()) {
                this.yVelocity -= 30;
            }
            else
            {
                this.speed = 0;
            }

            this.y += this.yVelocity;
            if (!this.grounded())
            {
                this.yVelocity += this.weight;
            }
            else
            {
                this.yVelocity = 0;
            }
            if(this.y > this.gameHeight - this.height) 
            {
                this.y = this.gameHeight - this.height;
            }
        }

        coinRefresh(coin) {
            const cx = coin.x - this.x;
            const cy = coin.y - this.y;
            const cDistance = Math.sqrt(cx * cx + cy * cy);
            if (cDistance < coin.width/3 + this.width/3){ 
                gameWon = true;
            }
            if (score == 2000) {
                gameOver = true;
            }
        }

        grounded(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Obstacle {
        constructor(gameWidth, gameHeight)
        {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('propImg')
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.toDelete = false;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width + 20, this.height - 20);
        }
        scroll(){
            this.x -= 5;
            if(this.x < 0 - this.width) 
            {
                this.toDelete = true;
            }
        }
    }

    class Coin {
        constructor(gameWidth, gameHeight)
        {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 450;
            this.height = 450;
            this.image = document.getElementById('coinImg')
            this.x = this.gameWidth/2;
            this.y = this.gameHeight/2 - this.height;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        scroll(){
            this.x -= 5;
        }
    }

    function addCoin(){
        if(score == 900)
        {
            coin = new Coin(canvas.width, canvas.height);
        }
        if (score >= 900) {
            coin.draw(ctx);
            coin.scroll();
        }
    }

    class Controls
    {
        constructor(){
            this.keys = [];
            window.addEventListener('keydown', e => {
                if (( e.key === 'ArrowDown'|| e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') 
                      && this.keys.indexOf(e.key) === -1){
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown'|| e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') 
                {
                    this.keys.splice(this.keys.indexOf(e.key) , 1);
                }
            });
        }
    }

    function addObstacles(timeChange){
        if(timer > timeLimit + obstacleInterval && score < 850)
        {
            obstacles.push(new Obstacle(canvas.width, canvas.height));
            obstacleInterval = Math.random() * 1500
            timer = 0;
        }
        else
        {
            timer += timeChange;
        }
        obstacles.forEach(obstacle => {
            obstacle.draw(ctx);
            obstacle.scroll();
        })
        obstacles = obstacles.filter(obstacles => !obstacles.toDelete);

        // Count Score 
        if (scoreCounter > 3) {
            scoreCounter = 0; 
            score++;
        } else {
            scoreCounter++;
        }
    }

    function displayText(scoreText){
        scoreText.fillStyle = 'white';
        scoreText.font = '40px Helvetica';
        scoreText.fillText('Score: ' + score, 20 ,50);
    }

    function isWon(){
        window.alert("You've won and earned 1000 points.");
    }

    function isLost(){
        window.alert("You've lost and earned " + score + " points. You can play again or keep your current points.");
    }

    const input = new Controls();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let prevTime = 0;
    let timer = 0;
    let timeLimit = 1000;
    let obstacleInterval = Math.random() * 600 + 500;

    function animate(timeStamp){
        const timeChange = timeStamp - prevTime;
        prevTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.drawCity(ctx);
        background.scroll();
        player.draw(ctx);
        player.refresh(input, obstacles);
        displayText(ctx);
        addObstacles(timeChange);
        addCoin();
        if (score >= 900) {
            player.coinRefresh(coin);
        }
        if (!gameOver && !gameWon)
        {
            requestAnimationFrame(animate);
        }
        if (gameWon) {
            isWon();
        } 
        if (gameOver) {
            isLost();
        }
    }
    animate(0);
});