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

  return {
    init: function () {
      var shape = {}
      shape.shape   = 'circle'
      shape.x       = 0
      shape.y       = 0
      shape.speed   = speed
      shape.height  = size
      shape.width   = size
      shape.rotate  = 0
      shape.color
      return shape
    },
    // square: function (size) {
    //   var s = this.init()
    // },
    // triangle: function (size) {
    //   var t = this.init()
    // },
    // circle: function (size) {
    //   var cir   = this.init()
    //   cir.size  = size
    //   return cir
    // },
    player: function (shape, controls) {
      var p         = this.init()
      p.shape       = shape
      p.lives       = lives
      p.score       = 0
      p.gun         = powerUps.guns.standard //standard
      p.shield      = powerUps.shields.noShield //shield
      p.controls    = controls
      p.shotFrames  = 1
      p.shotIncrement = function () {
        p.shotFrames++
      }
      p.shoot       = function () {
        if (p.shotFrames / (p.gun.rate * 60) >= 1) {
          var bullet = createCharacter.bullet(p.gun,
                                              p.rotate,
                                              p.x - p.width / 2,
                                              p.y - p.height / 2)
          onGameBoard.addCharacter(bullet)
          p.shotFrames = 0
        }
      }
      onGameBoard.addCharacter(p)
      return p
    },
    bullet: function (gun, direction, x, y) {
      var b         = this.init()
      b.shape       = 'circle'
      b.size        = gun.size
      b.speed       = gun.speed
      b.rate        = gun.rate
      b.x           = x
      b.y           = y
      b.direction   = direction
      return b
    },
    enemy: function (value) {
      var e   = this.init()
      e.value = value
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
      if (index < 0) {
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
  player1.x = c.canvas.width / 2
  player1.y = c.canvas.height / 2
  if (arguments.length > 1) {
  }
}

function startGame (players) {
  setStartPosition(players)
}

var shape1 = createCharacter.player('triangle', controls.player1)
shape1.color = '#0095DD'
startGame(shape1)

var shape2 = createCharacter.player('square', controls.player2)
shape2.color = '#DD9500'
startGame(shape2)

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

    //////////////////FIX, CIRCLE DOES NOT WORK////////////////////////
    circle: function (shape) {
      beginDraw(shape)
      var dx =  Math.sin(shape.direction) * shape.speed
      var dy = -Math.cos(shape.direction) * shape.speed
      shape.x += dx
      shape.y += dy
      q.arc(x, y, shape.size, 1, Math.PI * 2)
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
















































