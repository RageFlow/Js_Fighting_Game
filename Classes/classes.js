class Sprite {
    constructor({ name = 'none', position, imageSrc, scale = 1, framesMax = 1, framesMaxY = 1, offset = { x: 0, y: 0 } }) {
        this.name = name;
        this.position = position;
        this.height = 150;
        this.width = 50;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale
        this.framesMax = framesMax
        this.framesMaxY = framesMaxY
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 15
        this.offset = offset
    }

    draw() {
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            this.image.width / this.framesMax * this.scale,
            this.image.height * this.scale
        );
    }

    animatedFrames() {
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++
            } else {
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw();
        this.animatedFrames();
    }
}

class Fighter extends Sprite {
    constructor({
        name = 'none',
        position,
        velocity,
        offset,
        scale = 1,
        imageSrc,
        imageLookup,
        imageFillerX = 0,
        imageFillerY = 0,
        imageFlip = false,
        framesMax = 1,
        framesMaxY = 1
    }) {
        super({
            name,
            position,
            offset,
            scale,
            imageSrc,
            imageLookup,
            imageFillerX,
            imageFillerY,
            imageFlip,
            framesMax,
            framesMaxY,
        })
        this.velocity = velocity;
        this.height = 146;
        this.width = 80;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 100,
            height: 50,
        };
        this.health = 100;
        this.isAttacking;
        this.globalAttackCooldown = 0;
        this.attackCooldown = [
            0, // Attack 1
            0, // Attack 2
            0, // Attack 3
        ];
        this.attackDamage = 0;

        this.imageLookup = imageLookup;
        this.imageFillerX = imageFillerX;
        this.imageFillerY = imageFillerY;
        this.imageFlip = imageFlip;
        this.animationNumber = 0;
        this.animationHold = 0;
        this.isAttackAnim = false;
        this.hit = false;
        this.hitAnim = 0;
        this.hitAnimOffset = 0;
        this.attackNumber = 0;

        this.animationRow = 0;
        this.animationStart = 0;
        this.animationEnd = 0;
    }

    draw() {
        if (debug) {
            c.fillStyle = 'blue'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)

            c.fillStyle = 'purple'
            c.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height)
        }

        let tempCanvas = document.createElement('canvas');
        if (this.image.width != 0) { // If image has loaded
            tempCanvas.width = (this.image.width / this.framesMax) * this.scale;
            tempCanvas.height = (this.image.height / this.framesMaxY) * this.scale;
        }
        else { // Else use random
            tempCanvas.width = 50;
            tempCanvas.height = 100;
        }

        let ctx = tempCanvas.getContext('2d');
        if (this.imageFlip) {
            ctx.scale(-1, 1);
            ctx.translate(-tempCanvas.width, 0)
        }

        ctx.fillStyle = 'blue'
        // ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

        ctx.drawImage(
            this.image, // Image
            this.framesCurrent * (this.image.width / this.framesMax), // SX (Source x)
            (this.image.height / this.framesMaxY) * this.animationRow - (this.animationRow * 1), // SY (Source y)
            this.image.width / this.framesMax, // SW (Source width)
            this.image.height / this.framesMaxY, // SH (Source height)
            0, // X of Canvas (Canvas = image)
            0, // Y of Canvas (Canvas = image)
            (this.image.width / this.framesMax) * this.scale, // DW (Image width)
            (this.image.height / this.framesMaxY) * this.scale // DH (Image height)
        )

        if (this.hit && this.hitAnim != 0) {
            this.hitAnim -= 1
        }
        else {
            this.hit = false;
        }
        c.drawImage(
            tempCanvas,
            this.position.x - this.offset.x - this.width / 2 - (this.imageFillerX * this.scale),
            this.position.y - this.offset.y - this.imageFillerY * this.scale - 30,
            this.width * 2 + ((this.imageFillerX * this.scale) * 2),
            this.height * 2 + ((this.imageFillerY * this.scale) * 2)
        );
    }

    animatedFrames() {
        this.framesElapsed++
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.animationEnd && this.framesCurrent >= this.animationStart) {
                this.framesCurrent++
            }
            else if (!this.animationHold) {
                this.framesCurrent = this.animationStart;
            }
        }
    }

    update() {

        if (this.animationStart != this.imageLookup[this.animationNumber].start || this.animationRow != this.imageLookup[this.animationNumber].row) {
            this.framesCurrent = this.imageLookup[this.animationNumber].start
            console.log('Animation: ' + this.animationNumber)
        }
        this.animationRow = this.imageLookup[this.animationNumber].row;
        this.animationStart = this.imageLookup[this.animationNumber].start;
        this.animationEnd = this.imageLookup[this.animationNumber].end;

        this.draw();
        this.animatedFrames()

        this.attackBox.position.x = this.imageFlip ? (this.position.x - this.attackBox.width) : (this.position.x + this.width);
        this.attackBox.position.y = this.position.y + this.height / 2;

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y + this.height >= canvas.height - canvasBottomOffset) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += gravity;
        }

        if (this.globalAttackCooldown > 0) { // Global Attack Cooldown
            this.globalAttackCooldown--
        }

        for (let index = 0; index < this.attackCooldown.length; index++) { // Ability Cooldown
            const skill = document.querySelector('#player' + this.name + 'Skill' + index);
            const skillCooldown = document.querySelector('#player' + this.name + 'Cool' + index);
            if (this.attackCooldown[index] > 0) {
                this.attackCooldown[index] -= 1
                if (skill != null && skillCooldown != null) {
                    skillCooldown.innerHTML = this.attackCooldown[index]
                    skill.className = 'inactive'
                }
            }
            else {
                if (skill != null) {
                    skill.className = ''
                }
            }
        }
    }

    attack(attackNumber) {
        this.attackNumber = attackNumber;
        this.isAttacking = true;
        this.globalAttackCooldown = 50;
        this.attackCooldown[attackNumber] = attackLookup[attackNumber].cooldown;
        this.attackDamage = attackLookup[attackNumber].damage;
        var time = 0;
        this.isAttackAnim = true;
        if (attackNumber == 0) {
            time = (this.imageLookup[6].end - this.imageLookup[6].start) * 100;
        }
        else if (attackNumber == 1) {
            time = (this.imageLookup[7].end - this.imageLookup[7].start) * 100;
        }
        setTimeout(() => {
            this.isAttacking = false;
            this.isAttackAnim = false;
        }, time);
    }

    updateHealthHTML() {
        const playerHp = document.querySelector('#player' + this.name + 'Hp');
        var hp = (100 * this.health / 100);
        playerHp.style.width = hp > 0 ? hp + '%' : '0%';
        playerHp.innerHTML = hp > 0 ? hp + '%' : 'DEAD';
        if (hp <= 0) {
            playerHp.style.padding = '0'
        }
    }

}