var c = (function () {
  return {
    canvas: $('#game')[0],
    ctx:    $('#game')[0].getContext('2d')
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

  return {
    init: function () {
      var shape = {}
      shape.shape       = 'circle'
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
      shape.shotIncrement = function () {
        shape.shotFrames++
      }
      shape.shoot       = function (s) {
        if (s.shotFrames / (s.gun.rate * 60) >= 1) {
          var bullet = createCharacter.bullet(s.gun,
                                              s.rotate,
                                              s.x - s.width / 2,
                                              s.y - s.height / 2)
          bullet.player = s
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
              if (false) {//versus mode
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
      b.shape       = 'circle'
      b.size        = gun.size
      b.speed       = gun.speed
      b.rate        = gun.rate
      b.x           = x
      b.y           = y
      b.direction   = direction
      b.player
      return b
    },
    enemy: function (shape, size, speed, life, x, y) {
      var e   = this.init()
      e.type  = 'enemy'
      e.shape = shape
      e.speed = speed
      e.x     = x
      e.y     = y
      e.dx    = e.speed
      e.dy    = e.speed
      e.life  = life
      onGameBoard.addCharacter(e)
      return e
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

  return {
    guns: {
      standard: {size:    2,
                speed:    4,
                rate:     1,
                isReady:  function () {setReady(this.rate)},
                capacity: 99999999 }
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
      playerNumber--
      if (activeCharacters[playerNumber].type === 'player') {
        return activeCharacters[playerNumber]
      }
    }
  }
})()

var players = (function () {
  var player1 = createCharacter.player('triangle', controls.player1)
  player1.color = '#0095DD'
  var player2 = createCharacter.player('square', controls.player2)
  player2.color = '#DD9500'
  onGameBoard.addCharacter(player1)
  onGameBoard.addCharacter(player2)
  startGame(player1, player2)

  return {

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

function spawnEnemy (shape, size, speed, life, r, g, b) {
  var shapes = ['diamond', 'square', 'triangle']
  var randomShape = shapes[Math.random() * shapes.length]
  var x = Math.random() * (c.canvas.width - size)
  var y = Math.random() * (c.canvas.height - size)
  if (x < size) {
    x + size
  } else if (y < size) {
    y + size
  }
  var player1 = onGameBoard.player(1)
  var player2 = onGameBoard.player(2)
  if (Math.abs(player1.x - x) < 60 || Math.abs(player1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life)
  }
  if (Math.abs(player1.x - x) < 60 || Math.abs(player1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life)
  }
  var enemy = createCharacter.enemy(shape, size, speed, life, x, y)
  enemy.color = 'rgb('+r+' ,'+g+' ,'+b+')'

  var dx    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  var dy    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  enemy.dx  = dx
  enemy.dy  = dy
}

for (var i = 0; i < 10; i++) {
  var r = Math.round(Math.random() * 255)
  var g = Math.round(Math.random() * 255)
  var b = Math.round(Math.random() * 255)
  spawnEnemy('diamond', 30, 2, 1/*, r, g, b*/)
}

function startGame (player1, player2) {
  setStartPosition(player1, player2)
}


// var shape1 = createCharacter.player('triangle', controls.player1)
// shape1.color = '#0095DD'

// var shape2 = createCharacter.player('square', controls.player2)
// shape2.color = '#DD9500'
// startGame(shape1, shape2)


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
    q.fillStyle = shape.color
    q.fill()
    q.closePath()
    q.restore()
  }
  function translateShape (shape) {
    q.translate(shape.x + shape.width / 2, shape.y + shape.height)
  }
  return {
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
      endDraw(shape)
    },
    circle: function (shape) {
      beginDraw(shape)
      var dx =  Math.sin(shape.direction) * shape.speed
      var dy = -Math.cos(shape.direction) * shape.speed
      shape.x += dx
      shape.y += dy
      q.arc(x, y, shape.size, 0, Math.PI * 2)
      endDraw(shape)
    },
    diamond: function (shape) {
      beginDraw(shape)
      q.moveTo(0, -y)
      q.lineTo(x, 0)
      q.lineTo(0, y)
      q.lineTo(-x, 0)
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
    // console.log('All enemies gone!')
  }
}

function checkLoss (players) {
  if (players === 0) {
    // console.log('All players dead!')
  }
}













































