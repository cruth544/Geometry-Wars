function drawElements () {
  c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height)
  for (var i = onGameBoard.getAllCharacters().length - 1; i >= 0; i--) {
    var obj = onGameBoard.getAllCharacters()[i]
    drawThis[obj.shape](obj)
  }
  shape1.shotIncrement()
  shape2.shotIncrement()
  bothPlayersDoThis(movePlayer)
}

function bothPlayersDoThis (callback) {
  callback(shape1)
  if (shape2) {
    callback(shape2)
  }
}

////////////////////////////KEY LISTENERS///////////////////////////////
$(document).keydown(function(e) {
  keyListener.down(e)
})
$(document).keyup(function(e) {
  keyListener.up(e)
})

var keyListener = (function () {
  var keys = {}

  return {
    down: function (e) {
      keys[e.which] = true
      e.preventDefault()
      printKeys()
    },
    up: function (e) {
      delete keys[e.which]
      printKeys()
    },
    keyList: function () {
      return keys
    }
  }
})()

function movePlayer (player) {
  var keys    = keyListener.keyList()
  var control = player.controls
  var counter = 0
  var dx      =  Math.sin(player.rotate) * player.speed
  var dy      = -Math.cos(player.rotate) * player.speed
  var d       = player.speed
  var diagonal   = Math.sqrt(Math.pow(d, 2) + Math.pow(d, 2)) / 2
  function setDiagonal () {
    d = diagonal
  }

  if (keys[control.shoot]) {
    player.shoot()
  }
  if (!(keys[control.up] && keys[control.down])) {
    if (keys[control.up]) {
      player.rotate = 0

      if (!(keys[control.left] && keys[control.right])) {
        if (keys[control.left]) {
          player.rotate = -45 * Math.PI / 180

        } else if (keys[control.right]) {
          player.rotate = 45 * Math.PI / 180
        }
      }
      player.x += dx
      player.y += dy
      return
    }
    if (keys[control.down]) {
      player.rotate = Math.PI

      if (!(keys[control.left] && keys[control.right])) {
        if (keys[control.left]) {
          player.rotate = -135 * Math.PI / 180

        } else if (keys[control.right]) {
          player.rotate = 135 * Math.PI / 180
        }
      }
      player.x += dx
      player.y += dy
      return
    }
  }

  if (!(keys[control.left] && keys[control.right])) {
    if (keys[control.left]) {
      player.rotate = -90 * Math.PI / 180
      player.x += dx
    }
    if (keys[control.right]) {
      player.rotate = 90 * Math.PI / 180
      player.x += dx
    }
  }
}

function printKeys() {
    var html = '';
    for (var i in keyListener.keyList()) {
        if (!keyListener.keyList().hasOwnProperty(i)) continue;
        html += ' ' + i;
    }
    $('#out').html(html);
}


setInterval(drawElements, 1000 / 60)



















































