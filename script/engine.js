
  function drawElements () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawThis.shape(shape2)
    drawThis.shape(shape1)
    rotateShape(shape1)
    movePlayer(shape1)
    movePlayer(shape2)

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
  var d       = player.speed
  var diagonal   = Math.sqrt(Math.pow(d, 2) + Math.pow(d, 2)) / 2
  function setDiagonal () {
    d = diagonal
  }

  if (keys[control.shoot]) {
    player.shoot()
  }
  if (keys[control.up]) {
    if (keys[control.left]) {
      setDiagonal()
    } else if (keys[control.right]) {
      setDiagonal()
    }
    player.y += -d
  }
  if (keys[control.down]) {
    if (keys[control.left]) {
      setDiagonal()
    } else if (keys[control.right]) {
      setDiagonal()
    }
    player.y += d
  }
  if (keys[control.left]) {
    player.x += -d
  }
  if (keys[control.right]) {
    player.x += d
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



















































