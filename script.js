document.addEventListener('DOMContentLoaded', () => {
    const player = document.querySelector('.player');
    const sword = document.querySelector('.sword');
    const gameContainer = document.querySelector('.game-container');
    const levelDisplay = document.querySelector('.level');
    const killsDisplay = document.querySelector('.kills');
    
    let playerX = 100;
    let playerY = 100;
    let playerSpeed = 5;
    let isAttacking = false;
    let attackCooldown = false;
    let kills = 0;
    let level = 1;
    let enemies = [];
    let keys = {};
    let gameWidth = 800;
    let gameHeight = 600;
    
    // Inicializa a espada
    sword.classList.add('sword-level-1');
    
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // Controle de mouse (ataque)
    gameContainer.addEventListener('mousedown', () => {
        if (!attackCooldown) {
            attack();
        }
    });
    
    // Atualizações do jogo
    function update() {
        movePlayer();
        updateSwordPosition();
        updateEnemies();
        checkCollisions();
        requestAnimationFrame(update);
    }
    
    // Movimento do jogador
    function movePlayer() {
        if (keys['w'] && playerY > 0) {
            playerY -= playerSpeed;
        }
        if (keys['s'] && playerY < gameHeight - 80) {
            playerY += playerSpeed;
        }
        if (keys['a'] && playerX > 0) {
            playerX -= playerSpeed;
        }
        if (keys['d'] && playerX < gameWidth - 50) {
            playerX += playerSpeed;
        }
        
        player.style.left = playerX + 'px';
        player.style.bottom = (gameHeight - playerY - 80) + 'px';
    }
    
    // Posição da espada
    function updateSwordPosition() {
        if (isAttacking) return;
        
        sword.style.left = (playerX + 50) + 'px';
        sword.style.bottom = (gameHeight - playerY - 60) + 'px';
    }
    
    // Ataque
    function attack() {
        if (isAttacking) return;
        
        isAttacking = true;
        attackCooldown = true;
        sword.classList.add('sword-attacking');
        
        setTimeout(() => {
            sword.classList.remove('sword-attacking');
            isAttacking = false;
            
            setTimeout(() => {
                attackCooldown = false;
            }, 300);
        }, 200);
    }
    
    // Inimigos
    function spawnEnemy() {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        
        // Posição aleatória
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -40 : gameWidth;
            y = Math.random() * (gameHeight - 60);
        } else {
            x = Math.random() * gameWidth;
            y = Math.random() < 0.5 ? -60 : gameHeight;
        }
        
        enemy.style.left = x + 'px';
        enemy.style.bottom = (gameHeight - y - 60) + 'px';
        
        gameContainer.appendChild(enemy);
        
        const enemyObj = {
            element: enemy,
            x: x,
            y: y,
            speed: 1 + Math.random() * level * 0.5,
            health: 1
        };
        
        enemies.push(enemyObj);
        
        // Intervalo de spawn baseado no nível
        const spawnTime = Math.max(1000, 3000 - level * 200);
        setTimeout(spawnEnemy, spawnTime);
    }
    
    // Atualiza inimigos
    function updateEnemies() {
        enemies.forEach(enemy => {
            // Move em direção ao jogador
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.bottom = (gameHeight - enemy.y - 60) + 'px';
        });
    }
    
    // Verifica colisões
    function checkCollisions() {
        if (!isAttacking) return;
        
        const swordRect = sword.getBoundingClientRect();
        
        enemies.forEach((enemy, index) => {
            const enemyRect = enemy.element.getBoundingClientRect();
            
            if (
                swordRect.right > enemyRect.left &&
                swordRect.left < enemyRect.right &&
                swordRect.bottom > enemyRect.top &&
                swordRect.top < enemyRect.bottom
            ) {
                enemy.health--;
                
                if (enemy.health <= 0) {
                    // Inimigo derrotado
                    enemy.element.remove();
                    enemies.splice(index, 1);
                    kills++;
                    killsDisplay.textContent = `Inimigos: ${kills}`;
                    
                    // Verifica se subiu de nível
                    checkLevelUp();
                }
            }
        });
    }
    
    // Verifica se subiu de nível
    function checkLevelUp() {
        const killsNeeded = level * 5;
        
        if (kills >= killsNeeded) {
            level++;
            levelDisplay.textContent = `Nível: ${level}`;
            upgradeSword();
        }
    }
    
    // Melhora a espada
    function upgradeSword() {
        // Remove todas as classes de nível de espada
        sword.className = 'sword';
        
        // Adiciona a classe correspondente ao nível atual (máximo nível 6)
        const swordLevel = Math.min(level, 6);
        sword.classList.add(`sword-level-${swordLevel}`);
        
        // Efeito visual de upgrade
        sword.style.transform = 'scale(1.5)';
        setTimeout(() => {
            sword.style.transform = '';
        }, 300);
    }
    
    // Inicia o jogo
    spawnEnemy();
    update();
});
