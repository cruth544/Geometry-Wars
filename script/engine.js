function drawElements () {
  c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height)
  for (var i = 0; i < onGameBoard.getAllCharacters().length; i++) {
    var obj = onGameBoard.getAllCharacters()[i]
    drawThis[obj.shape](obj)
  }

  shape1.shotIncrement()
  shape2.shotIncrement()
  bothPlayersDoThis(movePlayer)
  collisionHappening()

  requestAnimationFrame(drawElements)
}

function bothPlayersDoThis (callback) {
  callback(shape1)
  if (shape2) {
    callback(shape2)
  }
}

function collisionHappening () {
  var all = onGameBoard.getAllCharacters()
  for (var i = 0; i < all.length; i++) {
    for (var j = 0; j < all.length; j++) {
      if (i === j) continue
      if (all[j].type === 'bullet') {
        if (outOfBounds(all[j])) {
          onGameBoard.removeCharacter(all[j])
          return
        }
      }
      var a = { x: all[i].x, y: all[i].y,
                w: all[i].width / 2, h: all[i].height / 2}
      var b = { x: all[j].x, y: all[j].y,
                w: all[j].width / 2, h: all[j].height / 2}

      if (a.x + a.w > b.x - b.w && a.x - a.w < b.x + b.w) {
        if (a.y + a.h > b.y - b.h && a.y - a.h < b.y + b.h) {
          if (collisionBetween(all[i], all[j])) return
        }
      }
    }
  }
}

function outOfBounds (object) {
  if (object.x + object.width / 2 < 0 ||
      object.x + object.width / 2 > c.canvas.width) {
    return true
  } else if ( object.y + object.height < 0 ||
              object.y + object.height > c.canvas.height) {
    return true
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

  if (keys[control.shoot]) {
    player.shoot(player)
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

      if (checkCollision(shape1, shape2) || outOfBounds(player)) {
        player.x -= dx
        player.y -= dy
        return
      }
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

      if (checkCollision(shape1, shape2) || outOfBounds(player)) {
        player.x -= dx
        player.y -= dy
        return
      }
      return
    }
  }

  if (!(keys[control.left] && keys[control.right])) {
    if (keys[control.left]) {
      player.rotate = -90 * Math.PI / 180
      player.x += dx
      if (checkCollision(shape1, shape2) || outOfBounds(player)) {
        player.x -= dx
        return
      }
    }
    if (keys[control.right]) {
      player.rotate = 90 * Math.PI / 180
      player.x += dx
      if (checkCollision(shape1, shape2) || outOfBounds(player)) {
        player.x -= dx
        return
      }
    }
  }
}

function moveEnemies () {
  var array = onGameBoard.getAllCharacters()
  for (var i = 0; i < array.length; i++) {
    if (array[i].type === 'enemy') {
      var dx =  Math.sin(Math.random() * 2 * Math.PI) * array[i].speed
      var dy = -Math.cos(Math.random() * 2 * Math.PI) * array[i].speed
      array[i].x += dx
      array[i].y += dy
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

drawElements()
// setInterval(drawElements, 1000 / 60)



















































