function collisionBetween (a, b) {
  // console.log("there was a colloision between ", a, "and ", b)
}

function checkCollision (a, b) {
  if (a === b) return false
  var a = { x: a.x, y: a.y,
            w: a.width / 2 - 1, h: a.height / 2 - 1}
  var b = { x: b.x, y: b.y,
            w: b.width / 2 - 1, h: b.height / 2 - 1}

  if (a.x + a.w > b.x - b.w && a.x - a.w < b.x + b.w) {
    if (a.y + a.h > b.y - b.h && a.y - a.h < b.y + b.h) {
      return true
    }
  }
  return false
}
