var canvas  = $('#game')[0]
var ctx     = canvas.getContext('2d')

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

var createCharacter = (function () {
  //default values
  var speed = 2
  var size  = 20
  var lives = 3

  return {
    init: function () {
      var shape = {}
      shape.x       = 0
      shape.y       = 0
      shape.speed   = speed
      shape.height  = size
      shape.width   = size
      shape.rotate  = 0
      shape.color
      return shape
    },
    triangle: function (size) {
      var t = this.init()
    },
    circle: function (size) {
      var c   = this.init()
      c.size  = size
      return c
    },
    player: function (controls) {
      var p       = this.init()
      p.lives     = lives
      p.score     = 0
      p.gun       = null //standard
      p.shield    = null //shield
      p.controls  = controls
      p.shoot     = function () {
        // body...
      }
      onGameBoard.addCharacter(p)
      return p
    },
    bullet: function (size, speed) {
      var b     = this.circle(1)
      b.speed   = speed
      b.size    = size
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

function setStartPosition (player1, player2) {
  var x, y
  player1.x = canvas.width / 2
  player1.y = canvas.height / 2
  if (arguments.length > 1) {
  }
}

function startGame (players) {
  setStartPosition(players)
}

var shape1 = createCharacter.player(controls.player1)
shape1.color = '#0095DD'
startGame(shape1)

var shape2 = createCharacter.player(controls.player2)
shape2.color = '#DD9500'
startGame(shape2)

var drawThis = (function () {
  return {
    shape: function (shape) {
      ctx.beginPath()
      ctx.rect(shape.x, shape.y, shape.width, shape.height)
      ctx.fillStyle = shape.color
      ctx.fill()
      ctx.closePath()
    }
  }
})()

// function rotateShape (shape) {
//   ctx.save()
//   ctx.rotate(shape.rotate)
//   ctx.beginPath()
//   ctx.fillStyle = shape.color
//   ctx.moveTo(shape.x, shape.y + shape.height)
//   ctx.lineTo(shape.x + shape.width / 2, shape.y)
//   ctx.lineTo(shape.x + shape.width, shape.y + shape.height)
//   ctx.fill()
//   ctx.closePath()
//   ctx.restore()
// }



















































