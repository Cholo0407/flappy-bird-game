class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.gameOver = false;
        this.score = 0;

        // Bird properties
        this.bird = {
            x: this.width / 3,
            y: this.height / 2,
            velocity: 0,
            gravity: 0.6,
            jump: -10,
            size: 30
        };

        // Pipes array
        this.pipes = [];
        this.pipeSpacing = 200;
        this.pipeGap = 150;
        this.pipeWidth = 60;

        // Audio context
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });
        this.canvas.addEventListener('click', () => this.jump());

        // Initialize first pipe
        this.addPipe();

        // Start game loop
        this.gameLoop();
    }

    jump() {
        if (this.gameOver) return;
        this.bird.velocity = this.bird.jump;
        this.playSound('jump');
    }

    addPipe() {
        const minHeight = 50;
        const maxHeight = this.height - this.pipeGap - minHeight;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;

        this.pipes.push({
            x: this.width,
            topHeight: height,
            passed: false
        });
    }

    playSound(type) {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        if (type === 'jump') {
            oscillator.frequency.value = 400;
            gainNode.gain.value = 0.1;
            oscillator.type = 'sine';
            
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'collision') {
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.2;
            oscillator.type = 'square';
            
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.3);
        }
    }

    checkCollision(pipe) {
        const birdRight = this.bird.x + this.bird.size;
        const birdLeft = this.bird.x;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.size;

        // Pipe collision
        if (birdRight > pipe.x && birdLeft < pipe.x + this.pipeWidth) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + this.pipeGap) {
                return true;
            }
        }

        // Ground and ceiling collision
        if (birdBottom > this.height || birdTop < 0) {
            return true;
        }

        return false;
    }

    update() {
        if (this.gameOver) return;

        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= 2;

            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
                this.playSound('collision');
                document.getElementById('gameOver').classList.remove('d-none');
                document.getElementById('finalScore').textContent = this.score;
                return;
            }

            // Score point
            if (!pipe.passed && pipe.x < this.bird.x) {
                pipe.passed = true;
                this.score++;
                document.getElementById('currentScore').textContent = this.score;
            }
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

        // Add new pipes
        if (this.pipes[this.pipes.length - 1].x < this.width - this.pipeSpacing) {
            this.addPipe();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw bird
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(
            this.bird.x + this.bird.size/2,
            this.bird.y + this.bird.size/2,
            this.bird.size/2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw pipes
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = '#75b855';
            
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.topHeight + this.pipeGap,
                this.pipeWidth,
                this.height - (pipe.topHeight + this.pipeGap)
            );
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

function restartGame() {
    document.getElementById('gameOver').classList.add('d-none');
    document.getElementById('currentScore').textContent = '0';
    new FlappyBird();
}

// Start game when page loads
window.onload = () => new FlappyBird();
