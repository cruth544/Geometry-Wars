const PLAYER_ONE      = 'triangle'
const COLOR_ONE       = '#0095DD'
const START_GUN_ONE   = 'standard'

const PLAYER_TWO      = 'triangle'
const COLOR_TWO       = '#DD9500'
const START_GUN_TWO   = 'standard'

const POWER_UP_COLOR  = 'rgb(0, 255, 0)'
const POWER_UP_SPAWN  = 0.995//0.9985

const ENEMY_SPAWN     = false
const ENEMY_START     = 5
const ENEMY_COLOR     = 'rgb(0, 0, 255)'
const MOB_SPAWN       = 0.997

const BOSS_SPAWN      = false
const BOSS_COLOR      = 'rgb(255, 0, 0)'
const BOSS_MOB_SPAWN  = 0.01

const OUTLINE_SHAPES  = true

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

var settings = (function () {
  var difficulty
  var player1Color
  var player2Color

})

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

var currentTimeouts = (function () {
  var arrayOfTimeOuts = []
  var timeoutOwners   = []

  return {
    addTimeout: function (timeout, owner) {
      arrayOfTimeOuts.push(timeout)
      timeoutOwners.push(owner)
    },
    removeTimeout: function (shape) {
      var index = timeoutOwners.indexOf(shape)
      if (index > -1) {
        arrayOfTimeOuts.splice(index, 1)
        timeoutOwners.splice(index, 1)
      }
    },
    getTimeout: function (timeout) {
      var index = arrayOfTimeOuts.indexOf(timeout)
      if (index > -1) {
        return arrayOfTimeOuts[index]
      }
    },
    getTimeoutFor: function (shape) {
      var index = timeoutOwners.indexOf(shape)
      if (index > -1) {
        var timeout = arrayOfTimeOuts[index]
        this.removeTimeout(timeoutOwners[index])
        return timeout
      }
    },
    getAllTimeouts: function () {
      return arrayOfTimeOuts
    },
    getAllPlayerTimeouts: function () {
      return timeoutOwners
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
      shape.gun         = powerUps.guns.standard()
      shape.shield      = powerUps.shields.noShield
      shape.shotFrames  = 1
      shape.equipGun    = function (gun) {
        clearTimeout(currentTimeouts.getTimeoutFor(shape))
        shape.gun = gun
        if (gun.timer < 10000) {
          currentTimeouts.addTimeout(shape.gunTimer(gun.timer), shape)
        }
      }
      shape.gunTimer    = function (time) {
        return setTimeout(function () {
          shape.equipGun(powerUps.guns.standard())
        }, time * 1000)
      }
      shape.shotIncrement = function () {
        shape.shotFrames++
      }
      shape.shoot       = function (s) {
        if (s.shotFrames / (s.gun.rate * 60) >= 1) {
          if (s.gun.capacity <= 0) {
            s.equipGun(powerUps.guns.standard())
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
    enemy: function (shape, size, speed, life, x, y, color) {
      if (ENEMY_SPAWN) {
        var e    = this.init()
        e.type   = 'enemy'
        e.color  = color
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
      }
    },
    boss: function (shape, size, speed, life, x, y, color) {
      if (BOSS_SPAWN) {
        var boss          = this.enemy(shape, size, speed, life, x, y)
        boss.isBoss       = true
        boss.target       = 1
        boss.x            = x
        boss.y            = y
        boss.gun          = powerUps.guns.cannon()
        boss.gun.rate     = 0.7
        boss.gun.speed    = 3
        boss.gun.capacity = 999999999
        boss.color        = color

        onGameBoard.addCharacter(boss)
        return boss
      }
    },
    powerUp: function (item, size, x, y) {
      var powerUp   = this.init()
      powerUp.type  = 'powerUp'
      powerUp.item  = powerUps.guns[item]()
      powerUp.size  = size
      powerUp.color = 'rgb(0, 255, 0)'
      powerUp.x     = x
      powerUp.y     = y
      powerUp.onHit = function (self, hitter) {
        if (  hitter.type === 'bullet'
          ||  hitter.type === 'powerUp'
          ||  hitter.isBoss) {return}

        hitter.equipGun(self.item)
        self.pickedUp()
      }
      powerUp.pickedUp = function () {
        clearTimeout(powerUp.timer)
        onGameBoard.removeCharacter(powerUp)
      }
      powerUp.timer = (function () {
        setTimeout(function () {
          onGameBoard.removeCharacter(powerUp)
        }, powerUp.item.timer * 1000)
      })()

      onGameBoard.addCharacter(powerUp)
      return powerUp
    }
  }
})()

///////////////////////////Power Ups///////////////////////////////////

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
      standard:   function () {
        return new GunBase(2, 4, 1, 999999999, 999999999)
      },
      machineGun: function () {
        return new GunBase(2, 4, 0.1, 50, 15)
      },
      cannon: function  () {
        return new GunBase(12, 2, 2, 10, 30)
      },
      laser: function () {
        return new GunBase(1, 7, .001, 500, 5)
      }
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



//////////////////////////////START GAME////////////////////////////////
var players     = (function () {
  var player1   = createCharacter.player(PLAYER_ONE, controls.player1)
  player1.color = COLOR_ONE
  player1.equipGun(powerUps.guns[START_GUN_ONE]())
  var player2   = createCharacter.player(PLAYER_TWO, controls.player2)
  player2.color = COLOR_TWO
  player2.equipGun(powerUps.guns[START_GUN_TWO]())

  startGame(player1, player2)

  //start out with 5 enemies
  for (var i = 0; i < ENEMY_START; i++) {
    spawnEnemy('diamond', 30, 2, 1, 'enemy', ENEMY_COLOR)
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

function spawnEnemy (shape, size, speed, life, enemyType, color) {
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
    return spawnEnemy(shape, size, speed, life, enemyType, color)
  }
  if (Math.abs(player1.x - x) < 60 || Math.abs(player1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life, enemyType, color)
  }
  var enemy = createCharacter[enemyType](shape, size, speed, life, x, y, color)

  if (ENEMY_SPAWN) {
    var dx    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
    var dy    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
    enemy.dx  = dx
    enemy.dy  = dy
  }
}

function spawnPowerUp () {
  // var type    = ['guns', 'shields']
  var guns    = ['machineGun', 'cannon', 'laser']
  var sizes   = [5, 10, 3]
  var pick    = Math.floor(Math.random() * guns.length)
  var x       = Math.random() * (c.canvas.width - sizes[pick])
  var y       = Math.random() * (c.canvas.height - sizes[pick])

  createCharacter.powerUp(guns[pick], sizes[pick], x, y)
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
    if (OUTLINE_SHAPES) {
      q.lineWidth   = '2'
      q.strokeStyle = shape.color
      q.stroke()
    } else {
      q.fillStyle = shape.color
      q.fill()
      q.closePath()
    }
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
    if (b.type === 'powerUp') {
      b.onHit(b, a)
      return true
    }
  }

  // all cases where enemy is hit by something
  if (a.type === 'enemy') {
    if (b.type === 'bullet') {
      a.onHit(a, b)
      return true
    }
    if (b.type === 'powerUp') {
      b.onHit(b, a)
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
      // console.log('YOU WIN!!')
      gameMode.setVersus(true)
    } else {
      gameMode.setBoss(true)
      if (BOSS_SPAWN) spawnEnemy('square', 60, 1, 10, 'boss', 255, 0, 0)
    }
    // console.log('All enemies gone!')
  }
}

function checkLoss (players) {
  if (players === 0) {
    // console.log('All players dead!')
  }
}













































