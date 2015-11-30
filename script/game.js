var canvas  = $('#game')[0]
var ctx     = canvas.getContext('2d')

var Characters = (function () {
  return {
    Shape: function (shape) {
      this.x
      this.y
      this.height
      this.width
      this.shape = null
      this.color
      this.collision = function () {
        // body...
      }
      this.rotation = null
    },
    Player: function () {
      this.gun
      this.shield
      this.lives
      this.score
    },
    Enemy: function () {
      this.value
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
      if (index > 0) {
        activeCharacters.push(characters)
      }
    },
    removeCharacter: function (character) {
      var index = this.getIndexForChar(character)
      if (index > 0) {
        activeCharacters.splice(index, 1)
      }
    }
  }
})()

function startGame (players) {

}

var shape1 = new Characters.Shape()
shape1.x = canvas.width / 2
shape1.y = canvas.height / 2
shape1.height = 10
shape1.width = 10
shape1.color = '#0095DD'

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




















































