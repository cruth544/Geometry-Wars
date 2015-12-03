var c = (function () {
  return {
    canvas: $('#game')[0],
    ctx:    $('#game')[0].getContext('2d')
  }
})()

var gameMode = (function () {
  var versus  = false
  var single  = false
  var boss    = false
  return {
    setSingle:  function (bool) {
      single = bool
    },
    isSingle:   function () {
      return single
    },
    setVersus:  function (bool) {
      versus = bool
    },
    isVersus:   function () {
      return versus
    },
    setBoss:    function (bool) {
      boss = bool
    },
    isBoss:     function () {
      return boss
    }
  }
})()

var controls = (function () {
  return {
    player1: {
      up:     '87',
      down:   '83',
      left:   '65',
      right:  '68',
      shoot:  '32'
    }, player2: {
      up:     '38',
      down:   '40',
      left:   '37',
      right:  '39',
      shoot:  '16'
    }
  }
})()

////////////////////////////////////////////////////////////////////////

var createCharacter = (function () {
  //default values
  var speed = 2
  var size  = 20
  var lives = 3
  var life  = 1
  var color = 'white'

  return {
    init: function () {
      var shape = {}
      shape.shape       = 'circle'
      shape.color       = color
      shape.x           = 0
      shape.y           = 0
      shape.speed       = speed
      shape.height      = size
      shape.width       = size
      shape.rotate      = 0
      shape.life        = life
      shape.gun         = powerUps.guns.standard
      shape.shield      = powerUps.shields.noShield
      shape.shotFrames  = 1
      shape.equipGun       = function (gun) {
        shape.gun = gun
        shape.gunTimer(gun.timer)
      }
      shape.gunTimer    = function (time) {
        setTimeout(function () {
          shape.equipGun(powerUps.guns.standard)
        }, time * 1000)
      }
      shape.shotIncrement = function () {
        shape.shotFrames++
      }
      shape.shoot       = function (s) {
        if (s.shotFrames / (s.gun.rate * 60) >= 1) {
          if (s.gun.capacity <= 0) {
            s.equipGun(powerUps.guns.standard)
          }
          var bullet = createCharacter.bullet(s.gun,
                                              s.rotate,
                                              s.x + shape.width / 2,
                                              s.y + shape.height / 2)
          bullet.player = s
          s.gun.shoot()
          onGameBoard.addCharacter(bullet)
          s.shotFrames = 0
        }
      }
      shape.hit   = function (self) {
        self.life--
        if (!self.life) {
          onGameBoard.removeCharacter(self)
        }
      }
      shape.onHit   = function (shape, hitter) {
        //first check to see if both shapes are of same type
        if (hitter.type !== shape.type) {
          //check to see if hitter is a bullet
          if (hitter.type === 'bullet') {
            //check for shape shooting itself
            if (hitter.player === shape) return
              //make sure there is no friendly fire
            if (hitter.player.type === shape.type) {
              onGameBoard.removeCharacter(hitter)
              if (gameMode.isVersus()) {//versus mode
                onGameBoard.removeCharacter(shape)
              }
              return
            }
          } else {
          //if its not a bullet...
            hitter.hit(hitter)
          }
          //do hit calculations
          shape.hit(shape)
          hitter.hit(hitter)
        }
      }
      shape.color
      return shape
    },
    player: function (shape, controls) {
      var p         = this.init()
      p.type        = 'player'
      p.shape       = shape
      p.lives       = lives
      p.score       = 0
      p.controls    = controls

      onGameBoard.addCharacter(p)
      return p
    },
    bullet: function (gun, direction, x, y) {
      var b         = this.init()
      b.type        = 'bullet'
      b.shape       = 'bullet'
      b.size        = gun.size
      b.height      = gun.size
      b.width       = gun.size
      b.speed       = gun.speed
      b.rate        = gun.rate
      b.x           = x
      b.y           = y
      b.direction   = direction
      b.player
      return b
    },
    singlePlayer: function (gun, direction, x, y) {
      var single = this.bullet(gun, direction, x, y)

      return single
    },
    enemy: function (shape, size, speed, life, x, y) {
      var e    = this.init()
      e.type   = 'enemy'
      e.shape  = shape
      e.size   = size
      e.height = size
      e.width  = size
      e.speed  = speed
      e.x      = x
      e.y      = y
      e.dx     = e.speed
      e.dy     = e.speed
      e.life   = life
      onGameBoard.addCharacter(e)
      return e
    },
    boss: function (shape, size, speed, life, x, y, r, g, b) {
      var boss          = this.enemy(shape, size, speed, life, x, y)
      boss.isBoss       = true
      boss.target       = 1
      boss.x            = x
      boss.y            = y
      boss.gun          = powerUps.guns.cannon
      boss.gun.rate     = 0.6
      boss.gun.speed    = 4
      boss.gun.capacity = 999999999
      boss.color        = 'rgb('+r+', '+g+', '+b+')'

      return boss
    },
    powerUp: function (type) {
      var powerUp   = this.init()
      powerUp.type  = 'powerUp'

      return powerUp
    }
  }
})()

////////////////////////////////////////////////////////////////////////

var powerUps = (function () {
  function setReady (rate) {
    setTimeout(function () {
      return true
    }, rate * 1000)
  }
  function timeOut (timer) {
      setTimeout(function () {
        return true
      }, timer * 1000)
    }

  function GunBase (size, speed, rate, capacity, timer) {
    this.size     = size
    this.speed    = speed
    this.rate     = rate
    this.capacity = capacity
    this.timer    = timer
    this.isReady  = function () {setReady(this.rate)}
    this.shoot    = function () {this.capacity--}
  }

  return {
    guns: {
      standard:   new GunBase(2, 4, 1, 999999999, 15),
      machineGun: new GunBase(2, 4, 0.1, 50, 15),
      cannon:     new GunBase(10, 2, 2, 10, 30),
      laser:      new GunBase(1, 10, .001, 500, 15)
    },
    shields: {
      noShield: null
    }
  }
})()

////////////////////////////////////////////////////////////////////////

//keeps track of all objects on board
var onGameBoard = (function () {
  var activeCharacters = []

  return {
    getIndexForChar: function (character) {
      return activeCharacters.indexOf(character)
    },
    addCharacter: function (character) {
      var index = this.getIndexForChar(character)
      if (index < 0) {
        activeCharacters.push(character)
      }
    },
    removeCharacter: function (character) {
      var index = this.getIndexForChar(character)
      if (index >= 0) {
        activeCharacters.splice(index, 1)
      }
    },
    getAllCharacters: function () {
      return activeCharacters
    },
    player: function (playerNumber) {
      if (activeCharacters.length >= playerNumber) {
        playerNumber--
        if (activeCharacters[playerNumber].type === 'player') {
          return activeCharacters[playerNumber]
        }
      }
    }
  }
})()

var players     = (function () {
  var player1   = createCharacter.player('triangle', controls.player1)
  player1.color = '#0095DD'
  player1.equipGun(powerUps.guns.standard)
  var player2   = createCharacter.player('triangle', controls.player2)
  player2.color = '#DD9500'
  player2.equipGun(powerUps.guns.standard)

  onGameBoard.addCharacter(player1)
  onGameBoard.addCharacter(player2)
  startGame(player1, player2)

  //start out with 5 enemies
  for (var i = 0; i < 5; i++) {
    spawnEnemy('diamond', 30, 2, 1, 'enemy'/*, r, g, b*/)
  }
})()
////////////////////////////////////////////////////////////////////////

function setStartPosition (player1, player2) {
  var x, y
  player1.x = c.canvas.width / 2 - player1.width
  player1.y = c.canvas.height / 2
  if (arguments.length > 1) {
    player2.x = c.canvas.width / 2 + player2.width
    player2.y = c.canvas.height / 2
  }
}

function spawnEnemy (shape, size, speed, life, enemyType, r, g, b) {
  var x = Math.random() * (c.canvas.width - size)
  var y = Math.random() * (c.canvas.height - size)
  if (x < size) {
    x += size
  } else if (y < size) {
    y += size
  }
  var player1 = onGameBoard.player(1)
  var player2 = onGameBoard.player(2)
  if (!player1 && !player2) return

  if (Math.abs(player1.x - x) < 60 || Math.abs(player1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life, enemyType, r, g, b)
  }
  if (Math.abs(player1.x - x) < 60 || Math.abs(player1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life, enemyType, r, g, b)
  }
  var enemy = createCharacter[enemyType](shape, size, speed, life, x, y)
  // enemy.color = 'rgb('+r+' ,'+g+' ,'+b+')'

  var dx    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  var dy    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  enemy.dx  = dx
  enemy.dy  = dy
}

function spawnPowerUp () {
  var x = Math.random() * (c.canvas.width - size)
  var y = Math.random() * (c.canvas.height - size)

}

for (var i = 0; i < 10; i++) {
  var r = Math.round(Math.random() * 255)
  var g = Math.round(Math.random() * 255)
  var b = Math.round(Math.random() * 255)
  // spawnEnemy('diamond', 30, 2, 1, 'enemy'/*, r, g, b*/)
}

function startGame (player1, player2) {
  setStartPosition(player1, player2)
}

////////////////////////////////////////////////////////////////////////
var drawThis = (function () {
  // q is much shorter than c.ctx
  var q = c.ctx
  var x, y
  //repeated begining of drawing
  function beginDraw (shape) {
    //set x and y to midpoints
    x = shape.width / 2
    y = shape.height / 2
    q.save()
    translateShape(shape)
    q.rotate(shape.rotate)
    q.beginPath()
  }
  //repeated end of drawing
  function endDraw (shape) {
    q.lineWidth   = '2'
    q.strokeStyle = shape.color
    q.stroke()
    // q.fillStyle = shape.color
    // q.fill()
    // q.closePath()
    q.restore()
  }
  function translateShape (shape) {
    q.translate(shape.x + shape.width / 2, shape.y + shape.height / 2)
  }
  return {
    circle: function (shape) {
      beginDraw(shape)
      q.arc(-x, -y, shape.size, 0, 2 * Math.PI)
      endDraw(shape)
    },
    square: function (shape) {
      beginDraw(shape)
      q.rect(-x, -y, shape.width, shape.height)
      endDraw(shape)
    },
    triangle: function (shape) {
      beginDraw(shape)
      q.moveTo(0, -y)
      q.lineTo(x, y)
      q.lineTo(-x, y)
      q.lineTo(0, -y)
      endDraw(shape)
    },
    diamond: function (shape) {
      beginDraw(shape)
      q.moveTo(0, -y)
      q.lineTo(x, 0)
      q.lineTo(0, y)
      q.lineTo(-x, 0)
      q.lineTo(0, -y)
      endDraw(shape)
    },
    bullet: function (shape) {
      beginDraw(shape)
      var dx =  Math.sin(shape.direction) * shape.speed
      var dy = -Math.cos(shape.direction) * shape.speed
      shape.x += dx
      shape.y += dy
      // -x and -y are because we are using the same translateShape function and arc is different because it draws from the center, not top left
      q.arc(-x, -y, shape.size, 0, 2 * Math.PI)
      endDraw(shape)
    }
  }
})()

function collisionBetween (a, b) {
  //all cases where player is hit by something
  if (a.type === 'player') {
    if (b.type === 'enemy') {
      a.onHit(a, b)
      return true
    }
    if (b.type === 'bullet') {
      a.onHit(a, b)
      return true
    }
  }

  // all cases where enemy is hit by something
  if (a.type === 'enemy') {
    if (b.type === 'bullet') {
      a.onHit(a, b)
      return true
    }
  }

  if (a.type === 'player' && b.type === 'enemy') {
    a.onHit(a, b)
    return true
  }
}

function checkWin (enemies) {
  if (enemies === 0) {
    if (gameMode.isBoss()) {
      console.log('YOU WIN!!')
      gameMode.setVersus(true)
    } else {
      gameMode.setBoss(true)
      spawnEnemy('square', 60, 1, 10, 'boss', 255, 0, 0)
    }
    // console.log('All enemies gone!')
  }
}

function checkLoss (players) {
  if (players === 0) {
    // console.log('All players dead!')
  }
}













































