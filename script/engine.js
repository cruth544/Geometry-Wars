function drawElements () {
  c.canvas.backgroundColor = 'black'
  var player1 = onGameBoard.player(1)
  var player2 = onGameBoard.player(2)
  c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height)
  for (var i = 0; i < onGameBoard.getAllCharacters().length; i++) {
    var obj = onGameBoard.getAllCharacters()[i]
    drawThis[obj.shape](obj)
  }

  moveEnemies()
  if (player1) player1.shotIncrement()
  if (player2) player2.shotIncrement()
  bothPlayersDoThis(movePlayer)
  collisionHappening()
  if (Math.random() > 0.9985) {
    spawnPowerUp()
  }
  if (Math.random() > 0.997) {
    if (gameMode.isBoss()) {
      if (Math.random() > 0.01) {
        // spawnEnemy('diamond', 30, 2, 1, 'enemy', 0, 0, 255)
      }
    } else {
      // spawnEnemy('diamond', 30, 2, 1, 'enemy', 0, 0, 255)
    }
  }
  checkWin(enemiesLeft())
  checkLoss(playersLeft())

  requestAnimationFrame(drawElements)
}

function bothPlayersDoThis (callback) {
  var player1 = onGameBoard.player(1)
  var player2 = onGameBoard.player(2)
  if (player1) {
    callback(player1)
  }
  if (player2) {
    callback(player2)
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
                w: all[i].width, h: all[i].height}
      var b = { x: all[j].x, y: all[j].y,
                w: all[j].width, h: all[j].height}

      if (a.x + a.w > b.x && a.x < b.x + b.w) {
        if (a.y + a.h > b.y && a.y < b.y + b.h) {
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
  } else if ( object.y + object.height / 2 < 0 ||
              object.y + object.height / 2 > c.canvas.height) {
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
  // a quick refresh of the page
  if (e.keyCode === 13) {
    location.reload()
  }
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

////////////////////////////////MOVEMENT////////////////////////////////
function movePlayer (player) {
  var keys    = keyListener.keyList()
  var player1 = onGameBoard.player(1)
  var player2 = onGameBoard.player(2)
  var control = player.controls
  var counter = 0
  var dx      =  Math.sin(player.rotate) * player.speed
  var dy      = -Math.cos(player.rotate) * player.speed

  // if the player does not exist, DON'T DO ANYTHING!!!
  if (!player) return

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

      if (player2 ? checkCollision(player1, player2) : false) {
        player.x -= dx
        player.y -= dy
        return
      }
      if (outOfBounds(player)) {
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

      //check for collision with other player
      if (player2 ? checkCollision(player1, player2) : false) {
        player.x -= dx
        player.y -= dy
        return
      }
      //check if going out of bounds
      if (outOfBounds(player)) {
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
      if (player2 ? checkCollision(player1, player2) : false) {
        player.x -= dx
        return
      }
      if (outOfBounds(player)) {
        player.x -= dx
        return
      }
      return
    }
    if (keys[control.right]) {
      player.rotate = 90 * Math.PI / 180
      player.x += dx
      if (player2 ? checkCollision(player1, player2) : false) {
        player.x -= dx
        return
      }
      if (outOfBounds(player)) {
        player.x -= dx
        return
      }
      return
    }
  }
}

function moveEnemies () {
  var array = onGameBoard.getAllCharacters()
  for (var i = 0; i < array.length; i++) {
    var enemy = array[i]
    if (enemy.type === 'enemy') {
      enemy.shotIncrement()
      if (!enemy.isBoss) {
        if (Math.random() > 0.95) {
          var randomDirection = Math.random() * 2 * Math.PI
          enemy.rotate = randomDirection
          enemy.dx     =  Math.sin(randomDirection) * enemy.speed
          enemy.dy     = -Math.cos(randomDirection) * enemy.speed
        }
      } else {
        if (Math.random() > .9) {
          enemy.target      = Math.ceil(Math.random() * playersLeft())
        }
        if (enemy.target === 0) return
        var targetPlayer    = onGameBoard.player(enemy.target)

        if (targetPlayer) {
          var targetX       = targetPlayer.x + targetPlayer.width / 2
          var targetY       = targetPlayer.y + targetPlayer.height / 2
          var bossX         = enemy.x + enemy.width / 2
          var bossY         = enemy.y + enemy.height / 2
          var direction     = Math.atan2(targetY - bossY, targetX - bossX)
          enemy.rotate      = direction + Math.PI / 2

          if (Math.random() > .9) {
            enemy.dx        = Math.cos(direction) * enemy.speed
            enemy.dy        = Math.sin(direction) * enemy.speed
          }
        }
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


















































