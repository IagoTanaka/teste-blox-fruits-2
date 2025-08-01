document.addEventListener('DOMContentLoaded', () => {
    const player = document.querySelector('.player');
    const sword = document.querySelector('.sword');
    const gameContainer = document.querySelector('.game-container');
    const levelDisplay = document.querySelector('.level');
    const killsDisplay = document.querySelector('.kills');
    const healthDisplay = document.querySelector('.health');
    
    // Configurações do jogo
    let playerX = 100;
    let playerY = 100;
    let playerSpeed = 5;
    let isAttacking = false;
    let attackCooldown = false;
    let kills = 0;
    let level = 1;
    let maxHealth = 5;
    let health = maxHealth;
    let enemies = [];
    let keys = {};
    let gameWidth = 800;
    let gameHeight = 600;
    let lastEnemyAttackTime = 0;
    let enemyAttackCooldown = 1000;
    let invulnerable = false;
    
    // Inicializa a espada
    sword.classList.add('sword-level-1');
    updateHealthDisplay();
    
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
        checkEnemyAttacks();
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
            player.style.transform = 'scaleX(-1)';
        }
        if (keys['d'] && playerX < gameWidth - 50) {
            playerX += playerSpeed;
            player.style.transform = 'scaleX(1)';
        }
        
        player.style.left = playerX + 'px';
        player.style.bottom = (gameHeight - playerY - 80) + 'px';
    }
    
    // Posição da espada
    function updateSwordPosition() {
        if (isAttacking) return;
        
        const direction = player.style.transform === 'scaleX(-1)' ? -1 : 1;
        
        sword.style.left = (playerX + (direction === 1 ? 50 : -10)) + 'px';
        sword.style.bottom = (gameHeight - playerY - 60) + 'px';
        sword.style.transform = `scaleX(${direction})`;
    }
    
    // Ataque do jogador
    function attack() {
        if (isAttacking) return;
        
        isAttacking = true;
        attackCooldown = true;
        sword.classList.add('sword-attacking');
        
        // Efeito sonoro (simulado)
        playSound('attack');
        
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
        
        enemy.innerHTML = `
            <div class="enemy-head"></div>
            <div class="enemy-body"></div>
            <div class="enemy-arm left-arm"></div>
            <div class="enemy-arm right-arm"></div>
            <div class="enemy-leg left-leg"></div>
            <div class="enemy-leg right-leg"></div>
            <div class="enemy-sword"></div>
        `;
        
        // Posição aleatória
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -40 : gameWidth;
            y = Math.random() * (gameHeight - 80);
        } else {
            x = Math.random() * gameWidth;
            y = Math.random() < 0.5 ? -80 : gameHeight;
        }
        
        enemy.style.left = x + 'px';
        enemy.style.bottom = (gameHeight - y - 80) + 'px';
        
        gameContainer.appendChild(enemy);
        
        const enemyObj = {
            element: enemy,
            x: x,
            y: y,
            speed: 1 + Math.random() * level * 0.5,
            health: 1,
            attackCooldown: 0,
            lastAttackTime: 0
        };
        
        enemies.push(enemyObj);
        
        // Intervalo de spawn baseado no nível
        const spawnTime = Math.max(800, 2500 - level * 150);
        setTimeout(spawnEnemy, spawnTime);
    }
    
    // Atualiza inimigos
    function updateEnemies() {
        const now = Date.now();
        
        enemies.forEach(enemy => {
            // Move em direção ao jogador
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // Atualiza posição
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.bottom = (gameHeight - enemy.y - 80) + 'px';
            
            // Vira o inimigo na direção do jogador
            enemy.element.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            
            // Atualiza posição da espada do inimigo
            const enemySword = enemy.element.querySelector('.enemy-sword');
            const direction = enemy.element.style.transform === 'scaleX(-1)' ? -1 : 1;
            enemySword.style.left = direction === 1 ? '40px' : '-30px';
        });
    }
    
    // Verifica colisões da espada do jogador com inimigos
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
                    
                    // Efeito sonoro (simulado)
                    playSound('enemyDeath');
                    
                    // Verifica se subiu de nível
                    checkLevelUp();
                } else {
                    // Efeito de dano no inimigo
                    enemy.element.classList.add('damage-effect');
                    setTimeout(() => {
                        enemy.element.classList.remove('damage-effect');
                    }, 300);
                }
            }
        });
    }
    
    // Verifica ataques dos inimigos ao jogador
    function checkEnemyAttacks() {
        if (invulnerable) return;
        
        const now = Date.now();
        const playerRect = player.getBoundingClientRect();
        
        enemies.forEach(enemy => {
            // Verifica se o inimigo está atacando
            if (now - enemy.lastAttackTime < enemyAttackCooldown) return;
            
            const enemyRect = enemy.element.getBoundingClientRect();
            const enemySword = enemy.element.querySelector('.enemy-sword');
            const swordRect = enemySword.getBoundingClientRect();
            
            // Distância até o jogador
            const dx = playerX - enemy.x;
            const dy = playerY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se está perto o suficiente, ataca
            if (distance < 60) {
                enemy.element.classList.add('enemy-attacking');
                enemy.lastAttackTime = now;
                
                // Verifica se acertou o jogador
                setTimeout(() => {
                    if (
                        swordRect.right > playerRect.left &&
                        swordRect.left < playerRect.right &&
                        swordRect.bottom > playerRect.top &&
                        swordRect.top < playerRect.bottom
                    ) {
                        takeDamage(1);
                    }
                    
                    setTimeout(() => {
                        enemy.element.classList.remove('enemy-attacking');
                    }, 200);
                }, 200);
            }
        });
    }
    
    // Jogador toma dano
    function takeDamage(amount) {
        if (invulnerable) return;
        
        health -= amount;
        updateHealthDisplay();
        
        // Efeito visual
        player.classList.add('damage-effect');
        setTimeout(() => {
            player.classList.remove('damage-effect');
        }, 300);
        
        // Efeito sonoro (simulado)
        playSound('playerHit');
        
        // Temporariamente invulnerável
        invulnerable = true;
        setTimeout(() => {
            invulnerable = false;
        }, 1000);
        
        // Verifica se o jogador morreu
        if (health <= 0) {
            gameOver();
        }
    }
    
    // Atualiza display de vida
    function updateHealthDisplay() {
        const hearts = '❤'.repeat(health) + '♡'.repeat(maxHealth - health);
        healthDisplay.textContent = `Vida: ${hearts}`;
    }
    
    // Verifica se subiu de nível
    function checkLevelUp() {
        const killsNeeded = level * 5;
        
        if (kills >= killsNeeded) {
            level++;
            maxHealth++;
            health = maxHealth;
            levelDisplay.textContent = `Nível: ${level}`;
            updateHealthDisplay();
            upgradeSword();
            
            // Efeito sonoro (simulado)
            playSound('levelUp');
        }
    }
    
    // Melhora a espada
    function upgradeSword() {
        // Remove todas as classes de nível de espada
        sword.className = 'sword';
        
        // Adiciona a classe correspondente ao nível atual (máximo nível 6)
        const swordLevel = Math.min(level, 6);
        sword.classList.add(`sword-level-${swordLevel}`);
        
        // Mantém os elementos da espada
        sword.innerHTML = `
            <div class="sword-blade"></div>
            <div class="sword-handle"></div>
            <div class="sword-guard"></div>
            <div class="sword-pommel"></div>
        `;
        
        // Efeito visual de upgrade
        sword.style.transform = 'scale(1.5)';
        setTimeout(() => {
            sword.style.transform = '';
        }, 300);
    }
    
    // Game over
    function gameOver() {
        alert(`Game Over! Você alcançou o nível ${level} e derrotou ${kills} inimigos.`);
        location.reload();
    }
    
    // Simula efeitos sonoros
    function playSound(type) {
        // Na prática, você implementaria com arquivos de áudio reais
        console.log(`Playing sound: ${type}`);
    }
    
    // Inicia o jogo
    spawnEnemy();
    update();
});
