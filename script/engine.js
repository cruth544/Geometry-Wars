function drawElements () {
  c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height)
  for (var i = 0; i < onGameBoard.getAllCharacters().length; i++) {
    var obj = onGameBoard.getAllCharacters()[i]
    drawThis[obj.shape](obj)
  }
  moveEnemies()
  shape1.shotIncrement()
  shape2.shotIncrement()
  bothPlayersDoThis(movePlayer)
  collisionHappening()
  checkWin(enemiesLeft())
  checkLoss(playersLeft())
  // console.log(enemiesLeft())

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
      if (outOfBounds(all[j])) {
        if (all[j].type === 'bullet') {
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

function enemiesLeft () {
  var all = onGameBoard.getAllCharacters()
  var number = 0
  for (var i = 0; i < all.length; i++) {
    if (all[i].type === 'enemy') {
      number++
    }
  }
  return number
}

function playersLeft () {
  var all = onGameBoard.getAllCharacters()
  var number = 0
  for (var i = 0; i < all.length; i++) {
    if (all[i].type === 'player') {
      number++
      if (number === 2) {
        break
      }
    }
  }
  return number
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
  var dx      =  Math.floor(Math.sin(player.rotate) * player.speed)
  var dy      = Math.floor(-Math.cos(player.rotate) * player.speed)

  if (keys['13']) {
    location.reload()
  }

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
    var enemy = array[i]
    if (enemy.type === 'enemy') {
      enemy.shotIncrement()
      if (Math.random() > 0.95) {
        var randomDirection = Math.random() * 2 * Math.PI
        enemy.rotate = randomDirection
        enemy.dx     =  Math.sin(randomDirection) * enemy.speed
        enemy.dy     = -Math.cos(randomDirection) * enemy.speed
      }
      if (Math.random() > 0.3) {
        enemy.x += enemy.dx
        enemy.y += enemy.dy
        if (outOfBounds(enemy)) {
          enemy.x -= enemy.dx
          enemy.y -= enemy.dy
        }
      } else if (Math.random() > 0.4) {
        enemy.shoot(enemy)
      }
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



















































