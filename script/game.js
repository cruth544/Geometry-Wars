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
      shape.hit   = function (shape, bullet) {
        if (bullet.type !== shape.type) {
          shape.life--
          if (shape.life <= 0) {
            onGameBoard.removeCharacter(shape)
          }
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
    enemy: function (shape, size, speed, x, y) {
      var e   = this.init()
      e.type  = 'enemy'
      e.shape = shape
      e.speed = speed
      e.x     = x
      e.y     = y
      e.dx    = e.speed
      e.dy    = e.speed
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
    }
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
  var x = size + Math.random() * c.canvas.width - size
  var y = size + Math.random() * c.canvas.height - size
  if (Math.abs(shape1.x - x) < 60 || Math.abs(shape1.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life)
  }
  if (Math.abs(shape2.x - x) < 60 || Math.abs(shape2.y - y) < 60) {
    return spawnEnemy(shape, size, speed, life)
  }
  var enemy = createCharacter.enemy(shape, size, speed, life, x, y)
  enemy.color = 'rgb('+r+' ,'+g+' ,'+b+')'

  var dx    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  var dy    = Math.random() * enemy.speed * 2 * (Math.random() - 0.5)
  enemy.dx  = dx
  enemy.dy  = dy
}

function startGame (player1, player2) {
  setStartPosition(player1, player2)
}

var shape1 = createCharacter.player('triangle', controls.player1)
shape1.color = '#0095DD'

var shape2 = createCharacter.player('square', controls.player2)
shape2.color = '#DD9500'
startGame(shape1, shape2)

for (var i = 0; i < 10; i++) {
  var r = Math.round(Math.random() * 255)
  var g = Math.round(Math.random() * 255)
  var b = Math.round(Math.random() * 255)
  spawnEnemy('diamond', 30, 2, 10/*, r, g, b*/)
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
  if (a.type === 'player' && b.type === 'enemy') {
    a.hit(a, b)
    return true
  }

  // type a is a bullet
  if (a.type === 'bullet') {
    // make sure that the collision is not the object shooting bullet
    if (a.player !== b) {
      // console.log(b.type + ' got hit!!')
      // check if object hit is an enemy
      if (b.type === 'enemy') {
        // check that enemy did not hit another enemy
        if (a.player.type !== b.type && b.type === 'enemy') {
          // console.log('BOOM!')
          onGameBoard.removeCharacter(a)
          onGameBoard.removeCharacter(b)
          return true
        }
        //if it did hit an enemy, remove the bullet
        onGameBoard.removeCharacter(a)
        return true
      } else if (b.type === 'player') {
        // console.log('DEAD!')
        onGameBoard.removeCharacter(a)
        onGameBoard.removeCharacter(b)
        return true
      }
    }
  }
}

function checkWin (enemies) {
  if (enemies === 0) {
    console.log('All enemies gone!')
  }
}

function checkLoss (players) {
  if (players === 0) {
    console.log('All players dead!')
  }
}













































